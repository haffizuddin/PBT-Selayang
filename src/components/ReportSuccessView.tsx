import React from 'react';
import { SlopeReport } from '../types/slope';
import { CheckCircle, Search, Map, ArrowRight, ShieldCheck, Share2, Copy } from 'lucide-react';

interface ReportSuccessViewProps {
  report: SlopeReport;
  onTrackReport: (reportId: string) => void;
  onBackToMap: () => void;
}

export const ReportSuccessView: React.FC<ReportSuccessViewProps> = ({
  report,
  onTrackReport,
  onBackToMap
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopyRef = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(report.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 py-12 px-4 sm:px-6">
      <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Top Celebration / Confirmation Header */}
        <div className="bg-emerald-600 text-white p-8 text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-xs rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Laporan Berjaya Dihantar
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-md mx-auto leading-relaxed">
            Terima kasih kerana membantu pihak PBT memantau keselamatan kawasan cerun.
          </p>
        </div>

        {/* Report Summary Card per Prompt Section 8 */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            {/* Reference Number Callout */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Rujukan Aduan
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 tracking-wider">
                  {report.id}
                </span>
              </div>
              <button
                onClick={handleCopyRef}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
                title="Salin nombor rujukan"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>{copied ? 'Disalin' : 'Salin'}</span>
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Tarikh Laporan
                </span>
                <span className="font-semibold text-slate-800">
                  {report.dateReported}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Status Semasa
                </span>
                <span className="inline-block bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[11px]">
                  {report.status}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  ID Cerun
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {report.slopeId}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Kategori Masalah
                </span>
                <span className="font-semibold text-slate-800">
                  {report.category}
                </span>
              </div>

              <div className="col-span-2 pt-1 border-t border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Lokasi
                </span>
                <span className="font-semibold text-slate-800">
                  {report.slopeLocation} ({report.pbt})
                </span>
              </div>
            </div>

            {/* Photo preview if present */}
            {report.photoUrls.length > 0 && (
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Lampiran Foto
                </span>
                <div className="flex gap-2">
                  {report.photoUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="Bukti Laporan"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-300"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: "Jejak Aduan" & "Kembali ke Peta" (Section 8) */}
          <div className="space-y-3">
            <button
              onClick={() => onTrackReport(report.id)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-98"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span>Jejak Aduan Ini Sekarang</span>
              <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
            </button>

            <button
              onClick={onBackToMap}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 px-6 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Map className="w-4 h-4 text-slate-600" />
              <span>Kembali ke Peta Cerun Selangor</span>
            </button>
          </div>

          {/* Assurance footer */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Notis pengesahan dihantar ke sistem cawangan cerun PBT.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
