import React, { useState, useEffect } from 'react';
import { Slope } from '../types/slope';
import { generateSlopeQRDataUrl, getSlopePermanentUrl } from '../utils/qrHelper';
import { 
  ArrowLeft, AlertTriangle, QrCode, MapPin, Calendar, ShieldCheck, 
  ExternalLink, Printer, Compass, Activity, Eye, Smartphone, Share2, Check
} from 'lucide-react';

interface SlopeDetailViewProps {
  slope: Slope;
  onBackToMap: () => void;
  onOpenReport: (slope: Slope) => void;
  onOpenSignboardModal: (slope: Slope) => void;
}

export const SlopeDetailView: React.FC<SlopeDetailViewProps> = ({
  slope,
  onBackToMap,
  onOpenReport,
  onOpenSignboardModal
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isMobileSimulation, setIsMobileSimulation] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const permanentUrl = getSlopePermanentUrl(slope.id);
  const safeLat = typeof slope.coordinates?.[0] === 'number' && !isNaN(slope.coordinates[0]) ? slope.coordinates[0] : 3.0738;
  const safeLng = typeof slope.coordinates?.[1] === 'number' && !isNaN(slope.coordinates[1]) ? slope.coordinates[1] : 101.5183;

  useEffect(() => {
    generateSlopeQRDataUrl(slope.id).then(setQrDataUrl);
  }, [slope.id]);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(permanentUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Top Breadcrumb & Simulation Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToMap}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Peta</span>
            </button>
            <div className="hidden sm:flex items-center text-xs text-slate-400 gap-1.5">
              <span>Peta GIS</span>
              <span>/</span>
              <span>Cerun Selangor</span>
              <span>/</span>
              <span className="font-mono font-bold text-slate-800">{slope.id}</span>
            </div>
          </div>

          {/* Simulation Toggle & Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileSimulation(!isMobileSimulation)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isMobileSimulation
                  ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
              }`}
              title="Simulasi paparan imbasan telefon bimbit di tapak cerun"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{isMobileSimulation ? 'Mod Web Penuh' : 'Simulasi Imbasan QR Telefon'}</span>
            </button>

            <button
              onClick={() => onOpenSignboardModal(slope)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-2xs"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-600" />
              <span>Papan Tanda QR</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 shadow-2xs"
              title="Salin Pautan Kekal Cerun"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Disalin!' : 'Kongsi'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Responsive or Mobile Simulation wrapper */}
      <div className={`mx-auto ${isMobileSimulation ? 'max-w-md my-6 p-4 bg-slate-900 rounded-[2.5rem] shadow-2xl border-4 border-slate-800' : 'max-w-6xl px-4 sm:px-6 lg:px-8 pt-6'}`}>
        {isMobileSimulation && (
          <div className="bg-slate-900 text-slate-400 text-[10px] text-center pb-2 flex items-center justify-between px-4">
            <span className="font-semibold text-slate-200">📱 Simulasi Pengguna Awam Di Tapak Cerun</span>
            <span className="text-amber-400">4G LTE · GPS Aktif</span>
          </div>
        )}

        <div className={`${isMobileSimulation ? 'bg-white rounded-3xl overflow-hidden p-4 space-y-4 max-h-[85vh] overflow-y-auto' : 'space-y-6'}`}>
          {/* Top Banner / Heading per Prompt Section 3 */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                    Maklumat Cerun PBT Selangor
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs text-slate-500 font-medium">ID Unik Berdaftar</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                    {slope.id}
                  </h1>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-bold ${
                      slope.status === 'Normal'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : slope.status === 'Pemantauan'
                        ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                        : slope.status === 'Perhatian'
                        ? 'bg-orange-50 text-orange-800 border border-orange-200'
                        : 'bg-red-50 text-red-800 border border-red-200 animate-pulse'
                    }`}
                  >
                    STATUS: {slope.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-base text-slate-700 font-medium mt-1.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{slope.location}, Selangor</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {slope.pbt} · Daerah {slope.district}
                </p>
              </div>

              {/* Primary Call to Action: Report Issue (Section 6 & 7) */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
                <button
                  onClick={() => onOpenReport(slope)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm active:scale-98"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-300" />
                  <span>Lapor Masalah Cerun</span>
                </button>
                <div className="text-center text-[11px] text-slate-500 font-medium">
                  Saluran rasmi aduan tanpa perlu daftar akaun
                </div>
              </div>
            </div>
          </div>

          {/* Quick Mobile Scan Landing Notice (Prompt Section 6) */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2.5">
              <QrCode className="w-5 h-5 text-amber-700 shrink-0" />
              <div>
                <span className="font-bold">Pautan Terus Kod QR Cerun Fizikal: </span>
                <span className="font-mono text-[11px] text-amber-800 break-all">{permanentUrl}</span>
              </div>
            </div>
            <button
              onClick={() => onOpenReport(slope)}
              className="hidden sm:inline-block text-xs font-bold text-red-700 hover:underline shrink-0 ml-2"
            >
              Lapor Segera →
            </button>
          </div>

          {/* Grid Layout: Left Details, Right Status & QR */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Col 1 & 2: MAKLUMAT ASAS & STATUS SEMASA */}
            <div className="lg:col-span-2 space-y-6">
              {/* Site Photo & Inspection Imagery */}
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="relative h-64 sm:h-72 w-full bg-slate-900">
                  <img
                    src={slope.imageUrl || '/images/slope_site_inspection_1790577385302.jpg'}
                    alt={`Foto Cerun ${slope.id}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/slope_site_inspection_1790577385302.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-4">
                    <div className="text-white">
                      <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider block">
                        Tapak Kejuruteraan Cerun Berdaftar
                      </span>
                      <p className="text-sm font-bold text-slate-100">
                        {slope.name}
                      </p>
                      <p className="text-xs text-slate-300 font-mono">
                        Koordinat GPS: {safeLat.toFixed(4)}° N, {safeLng.toFixed(4)}° E
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CARD: MAKLUMAT ASAS (Prompt Section 3) */}
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 sm:p-6">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Maklumat Asas Cerun</span>
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    Didaftarkan: {slope.registeredDate}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">ID Cerun</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">{slope.id}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Lokasi</span>
                    <span className="font-semibold text-slate-800 truncate block">{slope.location}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Daerah</span>
                    <span className="font-semibold text-slate-800">{slope.district}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">PBT Bertanggungjawab</span>
                    <span className="font-semibold text-slate-800 truncate block">{slope.pbt}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Koordinat GPS</span>
                    <span className="font-mono text-slate-800 font-medium">
                      {safeLat.toFixed(4)}, {safeLng.toFixed(4)}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Jenis Cerun</span>
                    <span className="font-semibold text-slate-800">{slope.slopeType}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Ketinggian Cerun</span>
                    <span className="font-bold text-slate-900 text-sm">{slope.height} meter</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Kecerunan</span>
                    <span className="font-bold text-slate-900 text-sm">{slope.gradient}°</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Struktur Pengukuh</span>
                    <span className="font-medium text-slate-800 truncate block">{slope.condition.structureType}</span>
                  </div>
                </div>
              </div>

              {/* CARD: STATUS SEMASA (Prompt Section 4) */}
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 sm:p-6">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      Status Semasa & Kondisi Geoteknikal
                    </h3>
                  </div>
                  <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-semibold border border-amber-200">
                    Prototaip Demonstrasi PBT
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status Cerun</span>
                    <span className="text-sm font-bold text-slate-900">{slope.status}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tahap Risiko</span>
                    <span className={`text-sm font-bold ${
                      slope.riskLevel === 'Kritikal' || slope.riskLevel === 'Tinggi' ? 'text-red-600' : 'text-yellow-700'
                    }`}>{slope.riskLevel}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pemeriksaan Terakhir</span>
                    <span className="text-xs font-semibold text-slate-800">{slope.lastInspection}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pemeriksaan Seterusnya</span>
                    <span className="text-xs font-semibold text-slate-800">{slope.nextInspection}</span>
                  </div>
                </div>

                {/* Sub-Factors Indicator Grid (Section 4) */}
                <h4 className="text-xs font-bold uppercase text-slate-600 mb-2.5">
                  Pemeriksaan Elemen Fizikal Cerun
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-600">Sistem Saliran (Drainage):</span>
                    <span className="font-bold text-slate-800">{slope.condition.drainage}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-600">Hakisan Permukaan:</span>
                    <span className="font-bold text-slate-800">{slope.condition.surfaceErosion}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-600">Kewujudan Retakan:</span>
                    <span className="font-bold text-slate-800">{slope.condition.cracks}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-600">Litupan Vegetasi:</span>
                    <span className="font-bold text-slate-800">{slope.condition.vegetation}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-600">Pergerakan Tanah:</span>
                    <span className="font-bold text-slate-800">{slope.condition.groundMovement}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-600">Keadaan Keseluruhan:</span>
                    <span className="font-bold text-emerald-700">{slope.condition.stability}</span>
                  </div>
                </div>

                {/* Inspection Notes */}
                <div className="mt-4 p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-950">
                  <strong className="block text-blue-900 mb-0.5">Catatan Jurutera Pemeriksa:</strong>
                  <span>{slope.condition.notes}</span>
                </div>
              </div>
            </div>

            {/* Col 3: QR CODE & SIGNBOARD PREVIEW (Section 5) */}
            <div className="space-y-6">
              {/* QR Code Unique Identity Box */}
              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                      QR Cerun
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">PBT-QR-V1</span>
                </div>

                <div className="flex flex-col items-center text-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                  {qrDataUrl ? (
                    <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                      <img
                        src={qrDataUrl}
                        alt={`QR Code Cerun ${slope.id}`}
                        className="w-44 h-44 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-44 h-44 bg-slate-200 animate-pulse rounded-xl flex items-center justify-center text-xs text-slate-500">
                      Menjana QR...
                    </div>
                  )}

                  <div className="mt-3 text-xs text-slate-600 max-w-xs">
                    <p className="font-medium text-slate-800">
                      Imbas kod QR ini untuk melihat maklumat cerun atau melaporkan masalah.
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono break-all">
                      {permanentUrl}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <button
                    onClick={() => onOpenSignboardModal(slope)}
                    className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Lihat Papan Tanda Fizikal</span>
                  </button>

                  <button
                    onClick={() => onOpenReport(slope)}
                    className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Lapor Masalah Cerun Ini</span>
                  </button>
                </div>
              </div>

              {/* Physical Signboard Preview Box (Prompt Section 5) */}
              <div className="bg-slate-900 text-white rounded-2xl shadow-md p-4 border border-slate-800">
                <span className="text-[10px] text-amber-400 uppercase font-bold tracking-wider block mb-2">
                  Pratonton Papan Tanda Cerun Fizikal di Tapak
                </span>

                {/* Replica Signboard with official Selangor styling */}
                <div className="bg-amber-400 text-slate-950 p-4 rounded-xl border-4 border-slate-950 text-center shadow-inner">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="w-4 h-4 rounded-full bg-red-600"></span>
                    <span className="font-extrabold text-xs tracking-tight uppercase">
                      PBT SELANGOR · CERUN BERDAFTAR
                    </span>
                  </div>
                  <div className="bg-slate-950 text-white py-1 px-2 rounded mb-2 font-mono font-black text-sm tracking-wider">
                    ID CERUN: {slope.id}
                  </div>

                  {qrDataUrl && (
                    <div className="bg-white p-2 rounded-lg inline-block my-1 shadow-sm border border-slate-900">
                      <img src={qrDataUrl} alt="QR Tapak" className="w-24 h-24 object-contain" />
                    </div>
                  )}

                  <div className="text-[11px] font-bold text-slate-900 mt-1 leading-snug">
                    Imbas untuk:
                    <div className="text-[10px] font-medium text-slate-800">
                      • Maklumat cerun<br />
                      • Status semasa<br />
                      • Lapor masalah
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <button
                    onClick={() => onOpenSignboardModal(slope)}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline"
                  >
                    Buka Versi Cetakan Penuh & Fail Vektor →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Prompt Section 13: PUBLIC SAFETY INFORMATION ("Jika Anda Melihat Tanda Bahaya") */}
          <div className="bg-red-50/80 border-2 border-red-200 rounded-2xl p-5 sm:p-6 mt-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5 text-amber-300" />
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="text-base font-bold text-red-950">
                    Jika Anda Melihat Tanda Bahaya Pada Cerun Ini
                  </h3>
                  <p className="text-xs text-red-900 mt-0.5">
                    Komuniti setempat dinasihatkan agar sentiasa berwaspada terhadap tanda-tanda awal ketidakstabilan lereng bukit:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs text-red-950 font-medium">
                  <div className="bg-white/90 p-2.5 rounded-lg border border-red-200/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"></span>
                    <span>Retakan tanah yang semakin membesar</span>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-lg border border-red-200/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"></span>
                    <span>Pergerakan atau rayapan tanah</span>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-lg border border-red-200/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"></span>
                    <span>Batu atau bongkah tanah jatuh</span>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-lg border border-red-200/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"></span>
                    <span>Air keluar secara luar biasa dari lereng</span>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-lg border border-red-200/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"></span>
                    <span>Struktur penahan retak atau terbonjol</span>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-lg border border-red-200/80 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-600 shrink-0"></span>
                    <span>Tiang elektrik atau pokok kelihatan condong</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-red-200">
                  <p className="text-xs text-red-900">
                    Laporkan segera kepada pihak PBT melalui fungsi <strong>Lapor Masalah</strong> di laman ini.
                  </p>
                  <button
                    onClick={() => onOpenReport(slope)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition-colors shrink-0"
                  >
                    Buka Borang Lapor Masalah
                  </button>
                </div>

                {/* Emergency Separation Notice */}
                <div className="p-3 bg-red-900 text-white rounded-xl text-xs flex items-center justify-between gap-2">
                  <span className="font-semibold">
                    🚨 Untuk kecemasan segera yang mengancam nyawa atau tanah runtuh aktif:
                  </span>
                  <div className="flex items-center gap-3 shrink-0 font-mono font-bold">
                    <span className="bg-red-800 px-2 py-1 rounded">TALIAN 999</span>
                    <span className="hidden sm:inline bg-red-800 px-2 py-1 rounded">BILIK GERAKAN: 03-5544 7000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
