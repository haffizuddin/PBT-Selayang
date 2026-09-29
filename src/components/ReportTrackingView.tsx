import React, { useState } from 'react';
import { SlopeReport, Slope } from '../types/slope';
import { 
  Search, ArrowLeft, CheckCircle2, Clock, MapPin, 
  AlertTriangle, ShieldCheck, FileText, ChevronRight, User, Phone, Eye
} from 'lucide-react';

interface ReportTrackingViewProps {
  reports: SlopeReport[];
  initialReportId?: string;
  onViewSlopeDetail: (slopeId: string) => void;
  onBackToMap: () => void;
}

export const ReportTrackingView: React.FC<ReportTrackingViewProps> = ({
  reports,
  initialReportId = '',
  onViewSlopeDetail,
  onBackToMap
}) => {
  const [searchRef, setSearchRef] = useState(initialReportId || 'RPT-2026-00821');
  const [selectedReportId, setSelectedReportId] = useState(
    initialReportId || 'RPT-2026-00821'
  );

  // Active found report
  const activeReport = reports.find(
    (r) => r.id.toLowerCase() === selectedReportId.trim().toLowerCase()
  ) || reports[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchRef.trim()) {
      setSelectedReportId(searchRef.trim());
    }
  };

  // Helper for timeline indicator styling
  const getTimelineStatusIcon = (stepIndex: number, currentReportStatus: string) => {
    const statuses = ['Diterima', 'Dalam Semakan', 'Pemeriksaan Tapak', 'Tindakan', 'Selesai'];
    const activeIndex = statuses.indexOf(currentReportStatus);

    if (stepIndex < activeIndex) {
      return {
        dotClass: 'bg-emerald-600 text-white ring-4 ring-emerald-100',
        lineClass: 'bg-emerald-600',
        icon: <CheckCircle2 className="w-4 h-4 text-white" />
      };
    } else if (stepIndex === activeIndex) {
      return {
        dotClass: 'bg-amber-500 text-slate-950 ring-4 ring-amber-100 animate-pulse',
        lineClass: 'bg-slate-200',
        icon: <Clock className="w-4 h-4 text-slate-950" />
      };
    } else {
      return {
        dotClass: 'bg-slate-200 text-slate-400',
        lineClass: 'bg-slate-200',
        icon: <span className="w-2 h-2 rounded-full bg-slate-400"></span>
      };
    }
  };

  const timelineSteps = [
    { title: 'Aduan Diterima', desc: 'Laporan awam direkodkan ke pangkalan data SIAC Selangor' },
    { title: 'Dalam Semakan', desc: 'Pegawai teknikal PBT menyemak rekod cerun & klasifikasi' },
    { title: 'Pemeriksaan Tapak', desc: 'Jurutera turun ke lokasi cerun untuk pemeriksaan geoteknikal' },
    { title: 'Tindakan', desc: 'Kerja-kerja penyelenggaraan atau pembaikan oleh kontraktor PBT' },
    { title: 'Selesai', desc: 'Pengesahan penutupan aduan & keselamatan cerun terjamin' }
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={onBackToMap}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Peta</span>
          </button>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Sistem Jejak Aduan Awam PBT Selangor</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Main Heading & Search Bar per Prompt Section 9 */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Search className="w-6 h-6 text-amber-500" />
              <span>Jejak Status Aduan Cerun</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Masukkan Nombor Rujukan Aduan anda (contoh: <strong>RPT-2026-00821</strong>) untuk menyemak tindakan terkini pihak PBT.
            </p>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="mt-4 flex flex-col sm:flex-row gap-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchRef}
                onChange={(e) => setSearchRef(e.target.value)}
                placeholder="cth: RPT-2026-00821"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase tracking-wider"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm transition-colors"
            >
              Semak Aduan
            </button>
          </form>

          {/* Quick preset chips to test */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span className="text-[11px] font-semibold text-slate-400">Pilih Aduan Sampel:</span>
            {reports.map((rep) => (
              <button
                key={rep.id}
                type="button"
                onClick={() => {
                  setSearchRef(rep.id);
                  setSelectedReportId(rep.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                  selectedReportId === rep.id
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {rep.id}
              </button>
            ))}
          </div>
        </div>

        {/* Report Display Section */}
        {activeReport ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Col 1: Report Details Card */}
            <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs uppercase font-bold text-slate-400">
                  Butiran Aduan
                </span>
                <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[11px]">
                  {activeReport.status}
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Nombor Rujukan:
                </span>
                <span className="text-xl font-black font-mono text-slate-900">
                  {activeReport.id}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Cerun Terlibat:
                  </span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      {activeReport.slopeId}
                    </span>
                    <button
                      onClick={() => onViewSlopeDetail(activeReport.slopeId)}
                      className="text-xs text-amber-700 hover:underline font-bold flex items-center gap-0.5"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Lihat Profil Cerun</span>
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Lokasi:
                  </span>
                  <span className="font-medium text-slate-800 block">
                    {activeReport.slopeLocation}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {activeReport.pbt} · Daerah {activeReport.district}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Kategori Masalah:
                  </span>
                  <span className="font-bold text-red-700">
                    {activeReport.category}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Tarikh Dilaporkan:
                  </span>
                  <span className="font-medium text-slate-800">
                    {activeReport.dateReported}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Keterangan Asal Pelapor:
                  </span>
                  <p className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 mt-1 italic">
                    "{activeReport.description}"
                  </p>
                </div>

                {activeReport.photoUrls.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Lampiran Foto:
                    </span>
                    <div className="flex gap-2">
                      {activeReport.photoUrls.map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt="Foto Aduan"
                          className="w-20 h-20 rounded-lg object-cover border border-slate-200 shadow-2xs"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Col 2 & 3: Visual Progress Timeline (Prompt Section 9) */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                  Garis Masa Tindakan (Progress Timeline)
                </h3>
                <span className="text-xs text-slate-400">
                  Dikemaskini Automatik
                </span>
              </div>

              {/* Step indicator sequence:
                  ✓ Aduan Diterima
                  ✓ Dalam Semakan
                  ● Pemeriksaan Tapak
                  ○ Tindakan
                  ○ Selesai
              */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {timelineSteps.map((step, idx) => {
                  const style = getTimelineStatusIcon(idx, activeReport.status);
                  const isCurrent =
                    timelineSteps.findIndex((s) => s.title === activeReport.status) === idx;

                  return (
                    <div key={step.title} className="relative flex items-start gap-4">
                      {/* Circle indicator */}
                      <div
                        className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${style.dotClass}`}
                      >
                        {style.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-xs font-bold ${
                              isCurrent ? 'text-amber-800 font-extrabold' : 'text-slate-800'
                            }`}
                          >
                            {step.title}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded">
                              STATUS KINI
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {step.desc}
                        </p>

                        {/* Officer remarks if matched */}
                        {isCurrent && activeReport.officerRemarks && (
                          <div className="mt-2.5 p-2.5 bg-blue-50/80 border border-blue-200 rounded-lg text-[11px] text-blue-900 font-medium">
                            <span className="font-bold text-blue-950 block mb-0.5">
                              Maklum Balas Pegawai PBT:
                            </span>
                            {activeReport.officerRemarks}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* PBT Assurance notice */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Perlukan maklumat lanjut mengenai aduan ini?
                  </span>
                  <span>Hubungi Pusat Aduan Awam PBT melalui talian rasmi berpusat.</span>
                </div>
                <div className="font-mono font-bold text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-300">
                  03-5544 7000
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">
              Tiada aduan dijumpai dengan nombor rujukan "{searchRef}"
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Sila pastikan format nombor rujukan seperti RPT-2026-XXXXX.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
