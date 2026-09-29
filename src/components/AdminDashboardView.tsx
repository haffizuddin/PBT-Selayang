import React, { useState } from 'react';
import { Slope, SlopeReport, ReportStatus } from '../types/slope';
import { 
  BarChart3, AlertTriangle, ShieldCheck, FileText, CheckCircle2, 
  MapPin, Eye, Plus, ChevronRight, Filter, RefreshCw, Edit3
} from 'lucide-react';

interface AdminDashboardViewProps {
  slopes: Slope[];
  reports: SlopeReport[];
  onViewSlopeDetail: (slope: Slope) => void;
  onViewReport: (reportId: string) => void;
  onOpenAddSlope: () => void;
  onOpenRegistry: () => void;
  onUpdateReportStatus: (reportId: string, newStatus: ReportStatus, remarks?: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  slopes,
  reports,
  onViewSlopeDetail,
  onViewReport,
  onOpenAddSlope,
  onOpenRegistry,
  onUpdateReportStatus
}) => {
  const [selectedReportToEdit, setSelectedReportToEdit] = useState<SlopeReport | null>(null);
  const [newStatus, setNewStatus] = useState<ReportStatus>('Dalam Semakan');
  const [remarks, setRemarks] = useState('');

  // Active reports count
  const activeReportsCount = reports.filter(
    (r) => r.status !== 'Selesai'
  ).length;

  const handleOpenStatusModal = (report: SlopeReport) => {
    setSelectedReportToEdit(report);
    setNewStatus(report.status);
    setRemarks(report.officerRemarks || '');
  };

  const handleSaveStatus = () => {
    if (!selectedReportToEdit) return;
    onUpdateReportStatus(selectedReportToEdit.id, newStatus, remarks);
    setSelectedReportToEdit(null);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900 border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded text-[10px] tracking-wider uppercase">
                  PORTAL PBT
                </span>
                <span className="text-slate-400 text-xs">Cawangan Kejuruteraan & Cerun</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100">
                Dashboard Pengurusan Cerun
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Pusat Kawalan Geoteknikal & Pemantauan Laporan Komuniti Negeri Selangor
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenRegistry}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <span>Senarai Cerun</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={onOpenAddSlope}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Daftar Cerun Baharu</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Summary Cards per Prompt Section 10 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Jumlah Cerun */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Jumlah Cerun
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900">
                {slopes.length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Berdaftar di kawasan MPS
              </p>
            </div>
          </div>

          {/* Card 2: Cerun Dalam Pemantauan */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-800">
                Cerun Dalam Pemantauan
              </span>
              <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-700 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-yellow-700">
                {slopes.filter((s) => s.status === 'Pemantauan' || s.status === 'Perhatian').length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Status pemantauan / perhatian
              </p>
            </div>
          </div>

          {/* Card 3: Risiko Tinggi */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                Risiko Tinggi
              </span>
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-red-600">
                {slopes.filter((s) => s.status === 'Risiko Tinggi').length}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Perlu tindakan segera
              </p>
            </div>
          </div>

          {/* Card 4: Aduan Aktif */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                Aduan Aktif
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-purple-800">
                {activeReportsCount}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                Belum selesai
              </p>
            </div>
          </div>
        </div>

        {/* SENARAI ADUAN TERKINI (Prompt Section 10) */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">
                Senarai Aduan Terkini (Cawangan Cerun PBT)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengurusan dan tindakan maklum balas laporan awam berkaitan cerun
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {reports.length} aduan direkodkan
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">No. Aduan</th>
                  <th className="py-3 px-4">ID Cerun</th>
                  <th className="py-3 px-4">Lokasi</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Tarikh</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => {
                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {report.id}
                      </td>
                      <td className="py-3 px-4 font-mono text-amber-700 font-semibold">
                        <button
                          onClick={() => {
                            const foundSlope = slopes.find((s) => s.id === report.slopeId);
                            if (foundSlope) onViewSlopeDetail(foundSlope);
                          }}
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{report.slopeId}</span>
                        </button>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        <div>{report.slopeLocation}</div>
                        <div className="text-[10px] text-slate-400">{report.pbt}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        <span className="font-semibold text-slate-800">{report.category}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {report.dateReported}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            report.status === 'Selesai'
                              ? 'bg-emerald-100 text-emerald-800'
                              : report.status === 'Tindakan'
                              ? 'bg-blue-100 text-blue-800'
                              : report.status === 'Pemeriksaan Tapak'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewReport(report.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                            title="Lihat Butiran & Jejak"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat</span>
                          </button>
                          <button
                            onClick={() => handleOpenStatusModal(report)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                            title="Kemaskini Status Aduan"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Status</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Registry Preview Footer Bar */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-slate-800 block">Pangkalan Data Cerun PBT Selangor</span>
            <span className="text-slate-500">Mempunyai rekod geoteknikal, ketinggian, kecerunan, dan koordinat GPS tepat.</span>
          </div>
          <button
            onClick={onOpenRegistry}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-colors"
          >
            Buka Senarai Penuh Cerun ({slopes.length}) →
          </button>
        </div>
      </div>

      {/* Admin Status Update Modal */}
      {selectedReportToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">
                  Kemaskini Tindakan Aduan
                </h3>
                <p className="text-xs text-amber-400 font-mono mt-0.5">
                  {selectedReportToEdit.id} · Cerun {selectedReportToEdit.slopeId}
                </p>
              </div>
              <button
                onClick={() => setSelectedReportToEdit(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih Status Baharu Tindakan:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Diterima">Diterima</option>
                  <option value="Dalam Semakan">Dalam Semakan</option>
                  <option value="Pemeriksaan Tapak">Pemeriksaan Tapak</option>
                  <option value="Tindakan">Tindakan (Kerja Pembaikan)</option>
                  <option value="Selesai">Selesai (Ditutup)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Pegawai Bertugas:
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Masukkan catatan tindakan teknikal..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedReportToEdit(null)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveStatus}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold shadow-2xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
