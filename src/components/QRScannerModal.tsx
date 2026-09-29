import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import { Slope } from '../types/slope';
import { generateSlopeQRDataUrl, extractSlopeId } from '../utils/qrHelper';
import { STATUS_COLORS } from './InteractiveMap';
import { X, Camera, CameraOff, CheckCircle2, ChevronRight } from 'lucide-react';

interface QRScannerModalProps {
  slopes: Slope[];
  onClose: () => void;
  onScanComplete: (slope: Slope) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ slopes, onClose, onScanComplete }) => {
  const [cameraOn, setCameraOn] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [found, setFound] = useState<Slope | null>(null);
  const [demoSlope, setDemoSlope] = useState<Slope>(slopes[0]);
  const [demoQr, setDemoQr] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  useEffect(() => {
    generateSlopeQRDataUrl(demoSlope.id).then(setDemoQr);
  }, [demoSlope]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [onClose]);

  const succeed = (slope: Slope) => {
    stopCamera();
    setFound(slope);
    setTimeout(() => onScanComplete(slope), 900);
  };

  const startCamera = async () => {
    setMessage(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage('Pelayar ini tidak menyokong kamera. Guna pilihan demo di bawah.');
      return;
    }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      // <video> mounts after this state change; the effect below attaches the stream
      setCameraOn(true);
    } catch {
      setMessage('Kamera tidak dibenarkan. Benarkan akses kamera, atau guna pilihan demo di bawah.');
    }
  };

  // Decode frames from the live camera
  useEffect(() => {
    if (!cameraOn || !videoRef.current || !streamRef.current) return;
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
          const id = extractSlopeId(code.data);
          const match = id && slopes.find((s) => s.id.toLowerCase() === id.toLowerCase());
          if (match) {
            stopped = true;
            succeed(match);
            return;
          }
          setMessage('Kod QR ini bukan plat cerun MPS.');
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, [cameraOn, slopes]);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-slate-950/70 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92dvh]">
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <div>
            <h2 className="font-semibold text-slate-900">Imbas kod QR cerun</h2>
            <p className="text-xs text-slate-500">Halakan kamera ke plat QR di tapak cerun</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 text-slate-500 hover:text-slate-900" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 overflow-y-auto">
          {/* Viewfinder */}
          <div className="relative aspect-square w-full max-w-[300px] mx-auto rounded-2xl overflow-hidden bg-slate-900">
            {cameraOn ? (
              <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <button
                onClick={() => succeed(demoSlope)}
                className="absolute inset-0 grid place-items-center"
                title="Klik untuk simulasi imbasan"
              >
                {demoQr && <img src={demoQr} alt={`Plat QR ${demoSlope.id}`} className="w-44 h-44 rounded-lg" />}
              </button>
            )}
            <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-amber-400/80" />
            {found && (
              <div className="absolute inset-0 bg-emerald-600/95 text-white grid place-items-center text-center p-4">
                <div>
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
                  <div className="font-mono text-lg font-bold">{found.gis?.idCerun ?? found.id}</div>
                  <div className="text-sm opacity-90">Membuka maklumat cerun…</div>
                </div>
              </div>
            )}
          </div>

          {message && <p className="mt-3 text-center text-sm text-amber-700">{message}</p>}

          <div className="mt-4">
            {cameraOn ? (
              <button onClick={stopCamera} className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700">
                <CameraOff className="w-4 h-4" /> Tutup kamera
              </button>
            ) : (
              <button onClick={startCamera} className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white py-3 text-sm font-semibold">
                <Camera className="w-4 h-4" /> Buka kamera
              </button>
            )}
          </div>

          {/* Demo: no physical plate at hand */}
          <div className="mt-5 pb-5">
            <p className="text-xs font-medium text-slate-500 mb-2">Tiada plat QR? Pilih cerun untuk cuba simulasi:</p>
            <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
              {slopes.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => {
                      setDemoSlope(s);
                      succeed(s);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50"
                  >
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: STATUS_COLORS[s.status] }} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-mono text-sm font-semibold text-slate-900">{s.gis?.idCerun ?? s.id}</span>
                      <span className="block text-xs text-slate-500 truncate">{s.location}</span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
