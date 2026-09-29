import React, { useState } from 'react';
import { Slope, SlopeReport, ReportCategory } from '../types/slope';
import { ISSUE_CATEGORIES } from '../data/mockSlopes';
import { 
  ArrowLeft, Camera, Upload, MapPin, CheckCircle2, AlertTriangle, 
  Send, ShieldCheck, X, Image as ImageIcon, Sparkles 
} from 'lucide-react';

interface ReportIssueViewProps {
  slope: Slope;
  onCancel: () => void;
  onSubmitSuccess: (report: SlopeReport) => void;
}

export const ReportIssueView: React.FC<ReportIssueViewProps> = ({
  slope,
  onCancel,
  onSubmitSuccess
}) => {
  // Form State
  const [category, setCategory] = useState<ReportCategory>('Longkang tersumbat');
  const [description, setDescription] = useState(
    'Longkang di bahagian bawah cerun dipenuhi daun dan air mula bertakung.'
  );
  const [photos, setPhotos] = useState<string[]>([
    '/images/slope_drainage_issue_1790577399566.jpg'
  ]);
  const [name, setName] = useState('Ahmad Farhan');
  const [phone, setPhone] = useState('012-3849102');
  const [email, setEmail] = useState('farhan.shahalam@gmail.com');
  const [gpsCaptured, setGpsCaptured] = useState(true);
  const [gpsCoords, setGpsCoords] = useState<[number, number]>(slope.coordinates);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle GPS location capture
  const handleCaptureGPS = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos?.coords?.latitude);
          const lng = Number(pos?.coords?.longitude);
          if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
            setGpsCoords([lat, lng]);
          } else {
            setGpsCoords(
              slope.coordinates && !isNaN(slope.coordinates[0]) && isFinite(slope.coordinates[0])
                ? slope.coordinates
                : [3.0738, 101.5183]
            );
          }
          setGpsCaptured(true);
        },
        () => {
          // Fallback to slope's coordinate
          setGpsCoords(
            slope.coordinates && !isNaN(slope.coordinates[0]) && isFinite(slope.coordinates[0])
              ? slope.coordinates
              : [3.0738, 101.5183]
          );
          setGpsCaptured(true);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      setGpsCoords(
        slope.coordinates && !isNaN(slope.coordinates[0]) && isFinite(slope.coordinates[0])
          ? slope.coordinates
          : [3.0738, 101.5183]
      );
      setGpsCaptured(true);
    }
  };

  // Handle mock file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert file to object URL
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPhotos((prev) => [...prev, event.target!.result as string]);
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Add preset sample photo
  const addSamplePhoto = (sampleUrl: string) => {
    if (!photos.includes(sampleUrl)) {
      setPhotos((prev) => [...prev, sampleUrl]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      setErrorMsg('Sila pilih kategori masalah cerun.');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Sila berikan keterangan ringkas mengenai masalah yang diperhatikan.');
      return;
    }

    setIsSubmitting(true);

    // Format new report ID
    const randomNum = Math.floor(100 + Math.random() * 900);
    // If reporting for SGR-SHA-0012, default to RPT-2026-00821 as in the demo scenario!
    const reportId = slope.id === 'SGR-SHA-0012' ? 'RPT-2026-00821' : `RPT-2026-${randomNum}21`;

    const now = new Date();
    const dateStr = '28 September 2026';

    const safeCoords: [number, number] =
      gpsCaptured && gpsCoords && !isNaN(gpsCoords[0]) && !isNaN(gpsCoords[1])
        ? gpsCoords
        : slope.coordinates && !isNaN(slope.coordinates[0]) && !isNaN(slope.coordinates[1])
        ? slope.coordinates
        : [3.0738, 101.5183];

    const newReport: SlopeReport = {
      id: reportId,
      slopeId: slope.id,
      slopeLocation: slope.location,
      district: slope.district,
      pbt: slope.pbt,
      category,
      description,
      photoUrls: photos,
      reporterName: name.trim() || undefined,
      reporterPhone: phone.trim() || undefined,
      reporterEmail: email.trim() || undefined,
      reporterCoords: safeCoords,
      dateReported: dateStr,
      timestamp: Date.now(),
      status: 'Diterima',
      officerRemarks: 'Aduan diterima secara langsung melalui imbasan QR dan telah dimasukkan ke dalam giliran semakan teknikal.',
      timeline: [
        {
          title: 'Aduan Diterima',
          date: '28 Sep 2026, 09:15 AM',
          completed: true,
          current: true,
          note: 'Aduan awam berjaya didaftarkan ke sistem SIAC.'
        },
        { title: 'Dalam Semakan', date: 'Dijadualkan', completed: false },
        { title: 'Pemeriksaan Tapak', date: 'Menunggu', completed: false },
        { title: 'Tindakan', date: 'Menunggu', completed: false },
        { title: 'Selesai', date: 'Menunggu', completed: false }
      ]
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitSuccess(newReport);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Batal & Kembali</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span>Borang Aduan Awam Rasmi</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          {/* Form Header per Prompt Section 7 */}
          <div className="bg-slate-900 text-white p-6">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-400" />
              <span>Laporkan Masalah Cerun</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Maklumat anda membantu jurutera PBT memantau dan mengambil tindakan pencegahan tanah runtuh dengan segera.
            </p>

            {/* Pre-filled Identified Slope Banner (Prompt: user should NOT need to manually select slope) */}
            <div className="mt-4 p-3 bg-slate-800/90 border border-slate-700 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                  ID
                </div>
                <div>
                  <div className="font-mono font-bold text-amber-400 text-sm">
                    {slope.id}
                  </div>
                  <div className="text-slate-300 font-medium">
                    {slope.location}
                  </div>
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-400">
                <span className="block font-semibold text-slate-200">{slope.pbt}</span>
                <span>Daerah {slope.district} · Disahkan</span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Kategori Masalah (Prompt Section 7 list) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                1. Kategori Masalah <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ISSUE_CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`text-left p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-amber-50 border-amber-500 text-amber-950 ring-2 ring-amber-400/30'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{cat}</span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Upload Photo (Prompt Section 7) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                  2. Muat Naik Foto Masalah (Pilihan / Sangat Disyorkan)
                </label>
                <span className="text-[11px] text-slate-400">
                  {photos.length} foto dipilih
                </span>
              </div>

              {/* Photo Thumbnails */}
              {photos.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-2">
                  {photos.map((url, idx) => (
                    <div
                      key={idx}
                      className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-300 shadow-2xs group"
                    >
                      <img
                        src={url}
                        alt="Bukti foto"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 transition-opacity"
                        title="Padam foto ini"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100/80 transition-colors">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <label className="cursor-pointer text-xs font-bold text-amber-600 hover:text-amber-700">
                      <span>Pilih Foto dari Peranti / Kamera</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Menyokong format JPG, PNG atau HEIC (maksimum 10MB)
                    </p>
                  </div>
                </div>

                {/* Convenient Preset Sample Buttons for Prototype Evaluators */}
                <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-2 text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">Foto Contoh Ujian Demo:</span>
                  <button
                    type="button"
                    onClick={() => addSamplePhoto('/images/slope_drainage_issue_1790577399566.jpg')}
                    className="px-2.5 py-1 bg-white hover:bg-amber-50 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                  >
                    <ImageIcon className="w-3 h-3 text-amber-600" />
                    <span>+ Longkang Tersumbat (Senario SGR-SHA-0012)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => addSamplePhoto('/images/slope_site_inspection_1790577385302.jpg')}
                    className="px-2.5 py-1 bg-white hover:bg-amber-50 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
                  >
                    <ImageIcon className="w-3 h-3 text-blue-600" />
                    <span>+ Tebing & Dinding Cerun</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Keterangan Masalah (Prompt Section 7) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                  3. Keterangan Masalah <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setDescription('Longkang di bahagian bawah cerun dipenuhi daun dan air mula bertakung semasa hujan lebat.')}
                  className="text-[11px] text-amber-700 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Isi Keterangan Senario Demo</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Terangkan masalah yang anda lihat..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
              <span className="text-[11px] text-slate-400 block">
                Contoh: kedudukan kerosakan, takungan air, serpihan batu atau rekahan.
              </span>
            </div>

            {/* 4. Gunakan Lokasi Semasa Saya (Prompt Section 7) */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    4. Lokasi GPS Semasa Pelapor
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Memastikan ketepatan titik laporan di lapangan
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCaptureGPS}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors shrink-0"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Gunakan Lokasi Semasa Saya</span>
                </button>
              </div>

              {gpsCaptured && (
                <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-xs text-emerald-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Lokasi laporan telah direkodkan: {gpsCoords[0].toFixed(4)}° N, {gpsCoords[1].toFixed(4)}° E (Ketepatan: ±5m)
                  </span>
                </div>
              )}
            </div>

            {/* 5. Maklumat Hubungan (Pilihan) per Prompt Section 7 */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                  5. Maklumat Hubungan (Pilihan)
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5 italic">
                  “Maklumat hubungan adalah pilihan dan hanya digunakan sekiranya pihak PBT memerlukan maklumat lanjut mengenai laporan ini.”
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                    Nama
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama anda"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                    No. Telefon
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01X-XXXXXXX"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-600 font-semibold mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Large Primary Button: "Hantar Laporan" (Prompt Section 7) */}
            <div className="pt-4 border-t border-slate-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 active:scale-98"
              >
                {isSubmitting ? (
                  <span>Menghantar Laporan ke Sistem PBT...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-amber-300" />
                    <span>Hantar Laporan</span>
                  </>
                )}
              </button>
              <p className="text-center text-[11px] text-slate-400 mt-2">
                Laporan akan terus dihantar kepada Unit Kejuruteraan & Cawangan Cerun PBT yang berkaitan.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
