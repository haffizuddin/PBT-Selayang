import React, { useEffect, useState } from 'react';
import { Slope } from '../types/slope';
import { generateSlopeQRDataUrl, getSlopePermanentUrl } from '../utils/qrHelper';
import { 
  X, Printer, Download, Share2, Check, ExternalLink, AlertTriangle, 
  MapPin, ShieldCheck, Sparkles, Maximize2, Minimize2, QrCode, FileText 
} from 'lucide-react';

interface QRSignboardModalProps {
  slope: Slope | null;
  onClose: () => void;
  onOpenReport?: (slope: Slope) => void;
  onViewSlopeDetail?: (slope: Slope) => void;
}

export const QRSignboardModal: React.FC<QRSignboardModalProps> = ({ 
  slope, 
  onClose,
  onOpenReport,
  onViewSlopeDetail
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr-only' | 'signboard'>('qr-only');

  useEffect(() => {
    if (slope) {
      generateSlopeQRDataUrl(slope.id).then(setQrDataUrl);
    }
  }, [slope]);

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

  if (!slope) return null;

  const permanentUrl = getSlopePermanentUrl(slope.id);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(permanentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR-Cerun-${slope.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-2 sm:p-4 overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Fit-Screen Container: Constrained to 92vh with strict overflow containment */}
      <div className="bg-slate-900 text-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/80 w-full max-w-5xl h-[92vh] max-h-[820px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Compact Modal Header */}
        <div className="bg-slate-950/95 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-sm">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 tracking-tight">
                  {activeTab === 'qr-only' ? 'Kod QR Rasmi Cerun MPS' : 'Papan Tanda Fizikal Cerun Berdaftar MPS'}
                </h3>
                <span className="font-mono text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2 py-0.5 rounded border border-amber-500/30">
                  {slope.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {activeTab === 'qr-only'
                  ? 'Kod QR kekal menghubungkan terus ke profil cerun awam tanpa perlu log masuk'
                  : 'Spesifikasi Plat Aluminium Reflektif Gred Kejuruteraan Pemasangan Tapak · MPS'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="bg-slate-800 p-0.5 rounded-lg flex items-center text-xs">
              <button
                onClick={() => setActiveTab('qr-only')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'qr-only'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Kod QR Sahaja</span>
              </button>
              <button
                onClick={() => setActiveTab('signboard')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'signboard'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Plat Tanda Tapak</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
              title="Tutup (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Responsive 2-Column with Pure Fit-Screen Height */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* LEFT: THE SIGNBOARD / QR (Fit-screen scaling) */}
          <div className="md:col-span-7 bg-slate-950/50 p-3 sm:p-5 flex items-center justify-center overflow-hidden">
            
            {activeTab === 'signboard' ? (
              /* High-Contrast Malaysian PBT Aluminum Signboard Preview */
              <div
                id="printable-signboard"
                className="bg-amber-400 border-[5px] sm:border-[6px] border-slate-950 rounded-2xl p-3 sm:p-4 text-center text-slate-950 shadow-2xl relative flex flex-col justify-between h-full max-h-[68vh] sm:max-h-[72vh] w-auto aspect-[1/1.42] select-none"
              >
                {/* Top Warning Stripes */}
                <div className="h-2 w-full bg-[repeating-linear-gradient(45deg,#000,#000_8px,#f59e0b_8px,#f59e0b_16px)] rounded-xs shrink-0"></div>

                {/* MPS Header Lockup */}
                <div className="flex items-center justify-center gap-2 mt-1 shrink-0">
                  <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center text-amber-300 font-black text-[10px] border-2 border-slate-950 shrink-0 shadow-xs">
                    MPS
                  </div>
                  <div className="text-left">
                    <span className="block font-black text-[10px] sm:text-[11px] uppercase tracking-tight text-slate-950 leading-tight">
                      MAJLIS PERBANDARAN SELAYANG
                    </span>
                    <span className="block font-bold text-[8px] sm:text-[9px] text-slate-900 leading-tight">
                      CAWANGAN CERUN & GEOTEKNIKAL
                    </span>
                  </div>
                </div>

                {/* Sign Title */}
                <div className="bg-slate-950 text-white py-1 px-2.5 rounded-lg my-0.5 shadow-xs shrink-0">
                  <span className="block text-[8px] font-bold text-amber-400 uppercase tracking-widest leading-none mb-0.5">
                    SISTEM INFORMASI & ADUAN CERUN
                  </span>
                  <span className="block text-sm sm:text-base font-black tracking-tight leading-tight">
                    CERUN BERDAFTAR MPS
                  </span>
                </div>

                {/* Unique ID Badge */}
                <div className="bg-white border-2 border-slate-950 py-0.5 px-2.5 rounded-md inline-block shadow-2xs shrink-0 self-center">
                  <span className="text-[7px] uppercase font-bold text-slate-600 block leading-none">ID CERUN</span>
                  <span className="text-base sm:text-lg font-black font-mono tracking-wider text-slate-950 leading-tight">
                    {slope.id}
                  </span>
                </div>

                {/* Location text */}
                <div className="text-[10px] sm:text-[11px] font-bold text-slate-950 truncate px-2 shrink-0">
                  {slope.location}
                </div>

                {/* QR Code Container (Responsive fit inside flex container) */}
                <div className="bg-white p-2 rounded-xl border-2 sm:border-3 border-slate-950 shadow-md inline-flex flex-col items-center justify-center self-center shrink-0">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR Cerun ${slope.id}`}
                      className="w-24 h-24 sm:w-32 sm:h-32 object-contain"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center text-xs text-slate-500 animate-pulse">
                      Menjana QR...
                    </div>
                  )}
                  <span className="text-[7px] font-mono text-slate-600 font-bold mt-0.5">
                    Imbas Kamera Telefon
                  </span>
                </div>

                {/* Instructions */}
                <div className="bg-amber-300/90 border border-slate-950 rounded-md p-1 text-left shrink-0">
                  <span className="font-extrabold text-[8px] block text-slate-950 uppercase tracking-wide text-center">
                    Imbas Kod QR Untuk:
                  </span>
                  <div className="grid grid-cols-3 gap-1 text-[8px] font-bold text-slate-900 text-center mt-0.5">
                    <div className="bg-white/90 py-0.5 rounded border border-slate-950/20">
                      Maklumat
                    </div>
                    <div className="bg-white/90 py-0.5 rounded border border-slate-950/20">
                      Status
                    </div>
                    <div className="bg-white/90 py-0.5 rounded border border-slate-950/20 text-red-700">
                      Lapor Aduan
                    </div>
                  </div>
                </div>

                {/* Hotline Emergency Bar */}
                <div className="border-t border-dashed border-slate-950/80 pt-0.5 flex items-center justify-between text-[8px] font-extrabold text-slate-950 shrink-0">
                  <span>ADUAN MPS: 03-6126 5800</span>
                  <span>KECEMASAN: 999</span>
                </div>

                {/* Bottom Warning Stripes */}
                <div className="h-2 w-full bg-[repeating-linear-gradient(45deg,#000,#000_8px,#f59e0b_8px,#f59e0b_16px)] rounded-xs shrink-0"></div>
              </div>
            ) : (
              /* QR Only View */
              <div className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl border-4 border-slate-950 shadow-2xl text-slate-950 max-w-sm">
                <span className="text-xs uppercase font-extrabold text-slate-500">KOD QR KEKAL CERUN</span>
                <span className="text-xl font-black font-mono mt-0.5">{slope.id}</span>
                <div className="p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-inner my-4">
                  {qrDataUrl && (
                    <img
                      src={qrDataUrl}
                      alt={`QR ${slope.id}`}
                      className="w-48 h-48 object-contain"
                    />
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-700 text-center">
                  Mengandungi pautan rasmi terus ke profil cerun dan borang aduan awam tanpa perlu login.
                </p>
              </div>
            )}

          </div>

          {/* RIGHT: SPECIFICATIONS & ACTION CONTROLS */}
          <div className="md:col-span-5 bg-slate-900 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto border-t md:border-t-0 md:border-l border-slate-800">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                  Spesifikasi Plat Tapak
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  slope.status === 'Risiko Tinggi' 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                    : slope.status === 'Pemantauan'
                    ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}>
                  {slope.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Nama Cerun</span>
                  <span className="font-bold text-slate-100 text-sm leading-tight block">{slope.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">PBT</span>
                    <span className="font-medium text-slate-200">Majlis Perbandaran Selayang</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Daerah</span>
                    <span className="font-medium text-slate-200">{slope.district}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Koordinat GPS</span>
                    <span className="font-mono text-slate-200 font-bold">
                      {slope.coordinates[0].toFixed(4)}°, {slope.coordinates[1].toFixed(4)}°
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-semibold">Ketinggian / Sudut</span>
                    <span className="text-slate-200 font-semibold">
                      {slope.height}m / {slope.gradient}°
                    </span>
                  </div>
                </div>

                {/* Permanent Link display with Click-to-copy */}
                <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold block">URL Kekal (Dalam Kod QR):</span>
                    <button
                      onClick={handleCopy}
                      className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      {copied ? 'Disalin ✓' : 'Salin'}
                    </button>
                  </div>
                  <div className="font-mono text-[11px] text-amber-300 break-all select-all bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    {permanentUrl}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-800/40 p-2 rounded-lg border border-slate-800 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    Plat dicetak menggunakan bahan tahan cuaca (UV & hujan tropika) untuk ketahanan jangka panjang di tapak.
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Stack */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <button
                onClick={handlePrint}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Papan Tanda (Format A4 Tapak)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleDownloadQR}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Muat Turun QR</span>
                </button>

                <button
                  onClick={handleCopy}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Disalin!' : 'Salin Pautan'}</span>
                </button>
              </div>

              {onOpenReport && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenReport(slope);
                  }}
                  className="w-full py-2 px-3 bg-red-600/90 hover:bg-red-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Uji Lapor Masalah Cerun Ini</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
