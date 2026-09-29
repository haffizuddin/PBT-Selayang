import React, { useState, useEffect } from 'react';
import { Slope } from '../types/slope';
import { generateSlopeQRDataUrl, getSlopePermanentUrl } from '../utils/qrHelper';
import { 
  QrCode, Search, Filter, Eye, AlertTriangle, Printer, Download, 
  ExternalLink, MapPin, Check, Copy, Sparkles, ShieldAlert, ArrowRight, Smartphone
} from 'lucide-react';

interface QRGalleryViewProps {
  slopes: Slope[];
  onViewSlopeDetail: (slope: Slope) => void;
  onOpenSignboard: (slope: Slope) => void;
  onReportSlope: (slope: Slope) => void;
  onOpenScanner: () => void;
}

export const QRGalleryView: React.FC<QRGalleryViewProps> = ({
  slopes,
  onViewSlopeDetail,
  onOpenSignboard,
  onReportSlope,
  onOpenScanner
}) => {
  // Take exactly 10 units for the sample showcase (or all if filtered)
  const [sampleSlopes, setSampleSlopes] = useState<Slope[]>([]);
  const [qrCodeMap, setQrCodeMap] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    // Select the first 10 slopes as the core sample unit set for MPS
    const core10 = slopes.slice(0, 10);
    setSampleSlopes(core10);

    // Pre-generate QR codes for each
    core10.forEach((slope) => {
      generateSlopeQRDataUrl(slope.id).then((url) => {
        setQrCodeMap((prev) => ({ ...prev, [slope.id]: url }));
      });
    });
  }, [slopes]);

  // Filtered list
  const filteredSlopes = sampleSlopes.filter((slope) => {
    const matchSearch =
      searchQuery === '' ||
      slope.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slope.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slope.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchStatus =
      selectedStatus === 'Semua' || slope.status === selectedStatus;

    return matchSearch && matchStatus;
  });

  const handleCopyLink = (slopeId: string) => {
    const url = getSlopePermanentUrl(slopeId);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(slopeId);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleDownloadQR = (slope: Slope) => {
    const dataUrl = qrCodeMap[slope.id];
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR-Cerun-${slope.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Top Banner with MPS Official Branding */}
      <div className="bg-slate-900 border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
                  MAJLIS PERBANDARAN SELAYANG (MPS)
                </span>
                <span className="text-slate-400 text-xs font-medium">
                  Cawangan Cerun & Geoteknikal Daerah Gombak
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100 flex items-center gap-2.5">
                <QrCode className="w-7 h-7 text-amber-400" />
                <span>Koleksi 10 Unit Kod QR Cerun (Sampel PBT Selayang)</span>
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Setiap cerun berdaftar di bawah pentadbiran MPS mempunyai kod QR kekal dan plat tanda fizikal di tapak.
                Imbas kod QR di bawah untuk menguji capaian terus ke profil cerun dan saluran aduan awam.
              </p>
            </div>

            {/* Quick Scanner Action */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onOpenScanner}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>Simulasi Imbas Kamera</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Controls & Search Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ID (cth: MPS-SEL-0012) atau kawasan..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="Semua">Semua Status (10 Unit)</option>
              <option value="Normal">Normal</option>
              <option value="Pemantauan">Pemantauan</option>
              <option value="Perhatian">Perhatian</option>
              <option value="Risiko Tinggi">Risiko Tinggi</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              Menunjukkan {filteredSlopes.length} daripada 10 sampel cerun berdaftar MPS
            </span>
          </div>
        </div>

        {/* 10-UNIT QR GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {filteredSlopes.map((slope, index) => {
            const qrUrl = qrCodeMap[slope.id];
            const isCopied = copiedId === slope.id;

            return (
              <div
                key={slope.id}
                className="bg-white rounded-2xl shadow-xs hover:shadow-md border border-slate-200 overflow-hidden flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 group"
              >
                {/* Card Top Label */}
                <div className="bg-slate-900 text-white px-3.5 py-2.5 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                      #{index + 1}
                    </span>
                    <span className="font-mono text-xs font-extrabold tracking-wider text-slate-100">
                      {slope.id}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      slope.status === 'Normal'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : slope.status === 'Pemantauan'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        : slope.status === 'Perhatian'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse'
                    }`}
                  >
                    {slope.status}
                  </span>
                </div>

                {/* QR Code Presentation Box */}
                <div className="p-4 flex flex-col items-center text-center bg-gradient-to-b from-slate-50 to-white">
                  <div className="relative p-2.5 bg-white rounded-2xl border-2 border-slate-900 shadow-sm group-hover:border-amber-500 transition-colors">
                    {qrUrl ? (
                      <img
                        src={qrUrl}
                        alt={`QR ${slope.id}`}
                        className="w-36 h-36 sm:w-40 sm:h-40 object-contain mx-auto"
                      />
                    ) : (
                      <div className="w-36 h-36 flex items-center justify-center text-xs text-slate-400 animate-pulse">
                        Menjana QR...
                      </div>
                    )}
                    <div className="text-[9px] font-mono text-slate-400 mt-1 font-semibold">
                      Imbas Guna Kamera
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="mt-3 w-full text-left">
                    <h3 className="text-xs font-bold text-slate-900 truncate" title={slope.name}>
                      {slope.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{slope.location}</span>
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 pt-1.5 border-t border-slate-100 font-mono">
                      <span>Tinggi: {slope.height}m</span>
                      <span>{slope.gis ? `Kelas ${slope.gis.kelasKecerunan}` : `Sudut: ${slope.gradient}°`}</span>
                      <span>{slope.pbt.replace('Majlis Perbandaran Selayang (MPS)', 'MPS')}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-1.5">
                  <button
                    onClick={() => onOpenSignboard(slope)}
                    className="w-full py-2 px-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-amber-400" />
                    <span>Papar Kod QR (Fit Screen)</span>
                  </button>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => onViewSlopeDetail(slope)}
                      className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Profil Cerun</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <button
                      onClick={() => onReportSlope(slope)}
                      className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                      <span>Lapor</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                    <button
                      onClick={() => handleCopyLink(slope.id)}
                      className="hover:text-slate-900 flex items-center gap-1 font-semibold"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Disalin' : 'Salin URL'}</span>
                    </button>

                    <button
                      onClick={() => handleDownloadQR(slope)}
                      className="hover:text-slate-900 flex items-center gap-1 font-semibold"
                    >
                      <Download className="w-3 h-3" />
                      <span>Muat Turun</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Public Safety Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-amber-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center shrink-0">
              MPS
            </div>
            <div>
              <span className="font-extrabold block text-amber-950">
                Pemasangan Plat Kod QR Fizikal di Seluruh Majlis Perbandaran Selayang (MPS)
              </span>
              <span className="text-amber-800">
                Plat kod QR diperbuat daripada aluminium anodized tahan karat dan dipasang pada tiang tanda penanda lereng bukit berhampiran penempatan awam.
              </span>
            </div>
          </div>
          <div className="shrink-0 font-mono font-bold text-amber-950 bg-white/80 px-3 py-1.5 rounded-lg border border-amber-200">
            Talian Aduan Cerun MPS: 03-6126 5800
          </div>
        </div>

      </div>
    </div>
  );
};
