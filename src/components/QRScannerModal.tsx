import React, { useState, useEffect, useRef } from 'react';
import { Slope } from '../types/slope';
import jsQR from 'jsqr';
import { generateSlopeQRDataUrl, getSlopePermanentUrl, extractSlopeId } from '../utils/qrHelper';
import { 
  QrCode, X, Camera, ArrowRight, Smartphone, Sparkles, MapPin, 
  CheckCircle2, RefreshCw, Zap, ExternalLink, ShieldAlert, ChevronRight 
} from 'lucide-react';

interface QRScannerModalProps {
  slopes: Slope[];
  onClose: () => void;
  onScanComplete: (slope: Slope) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  slopes,
  onClose,
  onScanComplete
}) => {
  // Default to primary slope MPS-SEL-0012 or first slope
  const [selectedSlopeId, setSelectedSlopeId] = useState<string>(
    slopes.find((s) => s.id === 'MPS-SEL-0012')?.id || slopes[0]?.id || ''
  );
  const [isScanning, setIsScanning] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState<Slope | null>(null);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string>('');
  const [torchActive, setTorchActive] = useState(false);
  const [useRealCamera, setUseRealCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const selectedSlope = slopes.find((s) => s.id === selectedSlopeId) || slopes[0];

  // Generate QR image for the targeted slope in viewfinder
  useEffect(() => {
    if (selectedSlope) {
      generateSlopeQRDataUrl(selectedSlope.id).then(setQrPreviewUrl);
    }
  }, [selectedSlope]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Try real camera if requested
  const handleToggleRealCamera = async () => {
    if (useRealCamera) {
      // Turn off
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setUseRealCamera(false);
      return;
    }

    try {
      setCameraError(null);
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        streamRef.current = stream;
        // <video> only mounts after this state change; the effect below attaches the stream
        setUseRealCamera(true);
      } else {
        setCameraError('Kamera tidak disokong pada pelayar ini.');
      }
    } catch (err) {
      setCameraError('Akses kamera tidak dibenarkan atau tidak tersedia.');
      setUseRealCamera(false);
    }
  };

  // Attach camera stream and decode real QR codes frame by frame
  useEffect(() => {
    if (!useRealCamera || !videoRef.current || !streamRef.current) return;
    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.play().catch(() => {});

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let raf = 0;
    let stopped = false;

    const tick = () => {
      if (stopped) return;
      if (ctx && video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth) {
        const scale = Math.min(1, 640 / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
        if (code?.data) {
          const slopeId = extractSlopeId(code.data);
          const match = slopeId && slopes.find((s) => s.id.toLowerCase() === slopeId.toLowerCase());
          if (match) {
            stopped = true;
            setCameraError(null);
            handleTriggerScan(match);
            return;
          }
          setCameraError(`Kod QR dikesan tetapi bukan plat cerun MPS: ${code.data.slice(0, 60)}`);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, [useRealCamera, slopes]);

  // Trigger scan action
  const handleTriggerScan = (targetSlope?: Slope) => {
    const slopeToScan = targetSlope || selectedSlope;
    if (!slopeToScan) return;

    setIsScanning(true);
    setScannedSuccess(null);

    // Simulate viewfinder focus & recognition delay
    setTimeout(() => {
      setIsScanning(false);
      setScannedSuccess(slopeToScan);

      // Transition to slope profile after brief success confirmation
      setTimeout(() => {
        onScanComplete(slopeToScan);
      }, 700);
    }, 500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 text-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-800 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <span>Simulasi Imbas Kod QR Tapak</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                  MPS
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Uji pengalaman orang awam mengimbas kod QR di tiang cerun
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            title="Tutup (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Camera Area */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4">
          
          {/* CAMERA VIEWFINDER FRAME */}
          <div className="relative mx-auto w-full max-w-[340px] aspect-square bg-slate-950 rounded-2xl border-2 border-slate-800 flex flex-col items-center justify-center overflow-hidden shadow-2xl group select-none">
            
            {/* Real Camera Video Feed (if toggled) */}
            {useRealCamera ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              /* Simulated Camera Scene with ONLY the QR Code in Focus */
              <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-4">
                {/* Background subtle camera noise */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                {/* ONLY THE QR CODE IN FOCUS (Clean, pure QR square) */}
                <div 
                  onClick={() => handleTriggerScan(selectedSlope)}
                  className="relative z-10 bg-white p-3 rounded-2xl shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-200 border-2 border-white/90"
                  title="Ketik untuk imbas kod QR ini"
                >
                  {qrPreviewUrl ? (
                    <img
                      src={qrPreviewUrl}
                      alt={`QR ${selectedSlope?.id}`}
                      className="w-44 h-44 sm:w-48 sm:h-48 object-contain block mx-auto"
                    />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-slate-800">
                      <QrCode className="w-32 h-32" />
                    </div>
                  )}
                </div>

                <div className="text-[10px] font-mono text-slate-400 mt-2 font-semibold">
                  {selectedSlope?.id} · {selectedSlope?.location}
                </div>
              </div>
            )}

            {/* Viewfinder Target Framing Brackets */}
            <div className="absolute inset-6 border border-amber-400/30 rounded-2xl pointer-events-none flex flex-col justify-between p-2 z-20">
              <div className="w-full flex justify-between">
                <span className="w-6 h-6 border-t-3 border-l-3 border-amber-400 rounded-tl-sm"></span>
                <span className="w-6 h-6 border-t-3 border-r-3 border-amber-400 rounded-tr-sm"></span>
              </div>

              {/* Scanning Laser Beam Effect */}
              <div className={`w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#f59e0b] ${
                isScanning ? 'animate-bounce duration-300' : 'animate-pulse'
              }`}></div>

              <div className="w-full flex justify-between">
                <span className="w-6 h-6 border-b-3 border-l-3 border-amber-400 rounded-bl-sm"></span>
                <span className="w-6 h-6 border-b-3 border-r-3 border-amber-400 rounded-br-sm"></span>
              </div>
            </div>

            {/* Success Overlay Banner */}
            {scannedSuccess && (
              <div className="absolute inset-0 z-30 bg-emerald-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-bounce mb-2" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Kod QR Berjaya Dikesan!
                </span>
                <span className="font-mono text-base font-black text-white mt-0.5">
                  {scannedSuccess.id}
                </span>
                <span className="text-xs text-emerald-200 mt-1">
                  {scannedSuccess.location}
                </span>
                <span className="text-[10px] text-emerald-300 mt-2 font-mono bg-emerald-900/60 px-2 py-0.5 rounded">
                  Membuka Profil Cerun...
                </span>
              </div>
            )}

            {/* Top Viewfinder Status Overlay */}
            <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
              <span className="inline-flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-xs text-[10px] text-amber-300 font-mono px-2 py-0.5 rounded-full border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                <span>KAMERA AKTIF</span>
              </span>
              <button
                type="button"
                onClick={() => setTorchActive(!torchActive)}
                className={`p-1.5 rounded-full pointer-events-auto transition-colors ${
                  torchActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-900/80 text-slate-300 hover:text-white'
                }`}
                title="Lampu Suluh (Flash)"
              >
                <Zap className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Bottom Detected URL Pill */}
            <div className="absolute bottom-3 inset-x-3 z-20 pointer-events-auto">
              <div 
                onClick={() => handleTriggerScan(selectedSlope)}
                className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700/80 flex items-center justify-between text-xs cursor-pointer shadow-lg transition-colors group"
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <QrCode className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="font-mono text-[10px] text-amber-300 truncate">
                    {getSlopePermanentUrl(selectedSlope?.id || '')}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-400 group-hover:underline shrink-0 ml-1">
                  Ketik Imbas
                </span>
              </div>
            </div>

          </div>

          {/* Primary Action Button: IMBAS SEKARANG */}
          <div className="space-y-2">
            <button
              onClick={() => handleTriggerScan(selectedSlope)}
              disabled={isScanning}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 disabled:opacity-50"
            >
              <Camera className="w-4 h-4 text-slate-950" />
              <span>
                {isScanning ? 'Mengimbas Kod QR Tapak...' : `Imbas Kod QR Cerun (${selectedSlope?.id})`}
              </span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Di tapak sebenar, imbasan membuka terus URL cerun.</span>
              <button
                onClick={handleToggleRealCamera}
                className="text-amber-400 hover:underline flex items-center gap-1 text-[11px] font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>{useRealCamera ? 'Guna Simulasi Visual' : 'Guna Kamera Sebenar'}</span>
              </button>
            </div>
            {cameraError && (
              <p className="text-[11px] text-amber-400/90 text-center">{cameraError}</p>
            )}
          </div>

          {/* QUICK-SELECT SLOPE CARDS (10 Units of MPS) */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Pilih Plat Cerun MPS untuk Diimbas:
              </span>
              <span className="text-[10px] text-slate-400">
                10 Sampel Berdaftar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {slopes.slice(0, 10).map((s) => {
                const isSelected = s.id === selectedSlopeId;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSelectedSlopeId(s.id);
                      handleTriggerScan(s);
                    }}
                    className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-xs'
                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 text-slate-300'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-amber-400">
                          {s.id}
                        </span>
                        <span className={`text-[8px] px-1.5 py-0.2 rounded font-semibold ${
                          s.status === 'Normal'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : s.status === 'Pemantauan'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-200 truncate mt-0.5">
                        {s.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {s.location}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
