import React, { useState, useMemo } from 'react';
import { Slope, SlopeStatus, RiskLevel } from '../types/slope';
import { DISTRICTS, PBTS } from '../data/mockSlopes';
import { 
  ArrowLeft, Search, Plus, QrCode, Eye, Edit2, Filter, 
  MapPin, ShieldAlert, Check, X, ShieldCheck
} from 'lucide-react';

interface AdminSlopeRegistryProps {
  slopes: Slope[];
  onBackToDashboard: () => void;
  onViewSlopeDetail: (slope: Slope) => void;
  onOpenQRSignboard: (slope: Slope) => void;
  onOpenAddSlope: () => void;
  onUpdateSlope: (updatedSlope: Slope) => void;
}

export const AdminSlopeRegistry: React.FC<AdminSlopeRegistryProps> = ({
  slopes,
  onBackToDashboard,
  onViewSlopeDetail,
  onOpenQRSignboard,
  onOpenAddSlope,
  onUpdateSlope
}) => {
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('Semua Daerah');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Edit Slope Modal State
  const [editingSlope, setEditingSlope] = useState<Slope | null>(null);
  const [editStatus, setEditStatus] = useState<SlopeStatus>('Normal');
  const [editRisk, setEditRisk] = useState<RiskLevel>('Rendah');
  const [editLastInspection, setEditLastInspection] = useState('');
  const [editNextInspection, setEditNextInspection] = useState('');

  const filtered = useMemo(() => {
    return slopes.filter((s) => {
      const matchSearch =
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.location.toLowerCase().includes(search.toLowerCase()) ||
        s.name.toLowerCase().includes(search.toLowerCase());

      const matchDistrict =
        districtFilter === 'Semua Daerah' || s.district === districtFilter;

      const matchStatus =
        statusFilter === 'Semua' || s.status === statusFilter;

      return matchSearch && matchDistrict && matchStatus;
    });
  }, [slopes, search, districtFilter, statusFilter]);

  const handleStartEdit = (slope: Slope) => {
    setEditingSlope(slope);
    setEditStatus(slope.status);
    setEditRisk(slope.riskLevel);
    setEditLastInspection(slope.lastInspection);
    setEditNextInspection(slope.nextInspection);
  };

  const handleSaveEdit = () => {
    if (!editingSlope) return;
    const updated: Slope = {
      ...editingSlope,
      status: editStatus,
      riskLevel: editRisk,
      lastInspection: editLastInspection,
      nextInspection: editNextInspection
    };
    onUpdateSlope(updated);
    setEditingSlope(null);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 pb-16">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Dashboard</span>
            </button>
            <div className="hidden sm:flex items-center text-xs text-slate-400 gap-1.5">
              <span>Portal PBT</span>
              <span>/</span>
              <span className="font-bold text-slate-800">Senarai Penuh Cerun Berdaftar</span>
            </div>
          </div>

          <button
            onClick={onOpenAddSlope}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Daftar Cerun Baharu</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Controls Card */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                Senarai Cerun Berdaftar (PBT Selangor)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Pengurusan inventori geoteknikal, status pemantauan, dan plat papan tanda QR unik
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari ID atau lokasi..."
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-amber-500 w-44"
                />
              </div>

              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
              >
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none"
              >
                <option value="Semua">Semua Status</option>
                <option value="Normal">Normal</option>
                <option value="Pemantauan">Pemantauan</option>
                <option value="Perhatian">Perhatian</option>
                <option value="Risiko Tinggi">Risiko Tinggi</option>
              </select>
            </div>
          </div>
        </div>

        {/* Slopes Table (Prompt Section 11) */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">ID Cerun</th>
                  <th className="py-3 px-4">Lokasi</th>
                  <th className="py-3 px-4">Daerah</th>
                  <th className="py-3 px-4">PBT</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Tahap Risiko</th>
                  <th className="py-3 px-4">Pemeriksaan Terakhir</th>
                  <th className="py-3 px-4 text-center">QR</th>
                  <th className="py-3 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((slope) => {
                  return (
                    <tr
                      key={slope.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {slope.id}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <div>{slope.location}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {typeof slope.coordinates?.[0] === 'number' && !isNaN(slope.coordinates[0]) ? slope.coordinates[0].toFixed(4) : '3.0850'}, {typeof slope.coordinates?.[1] === 'number' && !isNaN(slope.coordinates[1]) ? slope.coordinates[1].toFixed(4) : '101.5350'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {slope.district}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-[150px]">
                        {slope.pbt}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                            slope.status === 'Normal'
                              ? 'bg-emerald-100 text-emerald-800'
                              : slope.status === 'Pemantauan'
                              ? 'bg-yellow-100 text-yellow-800'
                              : slope.status === 'Perhatian'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-red-100 text-red-800 animate-pulse'
                          }`}
                        >
                          {slope.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold whitespace-nowrap">
                        <span
                          className={
                            slope.riskLevel === 'Kritikal' || slope.riskLevel === 'Tinggi'
                              ? 'text-red-600'
                              : slope.riskLevel === 'Sederhana'
                              ? 'text-yellow-700'
                              : 'text-emerald-700'
                          }
                        >
                          {slope.riskLevel}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {slope.lastInspection}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onOpenQRSignboard(slope)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg inline-flex items-center justify-center transition-colors"
                          title="Papar & Cetak Papan Tanda QR"
                        >
                          <QrCode className="w-4 h-4 text-amber-600" />
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewSlopeDetail(slope)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                            title="Lihat Profil Awam"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Lihat</span>
                          </button>
                          <button
                            onClick={() => handleStartEdit(slope)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                            title="Edit Parameter Cerun"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => onOpenQRSignboard(slope)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                            title="Papan Tanda QR"
                          >
                            QR
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
      </div>

      {/* Edit Slope Quick Modal */}
      {editingSlope && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Kemaskini Parameter Cerun</h3>
                <p className="text-xs text-amber-400 font-mono mt-0.5">
                  {editingSlope.id} · {editingSlope.location}
                </p>
              </div>
              <button
                onClick={() => setEditingSlope(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Cerun:</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as SlopeStatus)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-800"
                >
                  <option value="Normal">Normal</option>
                  <option value="Pemantauan">Pemantauan</option>
                  <option value="Perhatian">Perhatian</option>
                  <option value="Risiko Tinggi">Risiko Tinggi</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tahap Risiko:</label>
                <select
                  value={editRisk}
                  onChange={(e) => setEditRisk(e.target.value as RiskLevel)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-800"
                >
                  <option value="Rendah">Rendah</option>
                  <option value="Sederhana">Sederhana</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Kritikal">Kritikal</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tarikh Pemeriksaan Terakhir:</label>
                <input
                  type="text"
                  value={editLastInspection}
                  onChange={(e) => setEditLastInspection(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tarikh Pemeriksaan Seterusnya:</label>
                <input
                  type="text"
                  value={editNextInspection}
                  onChange={(e) => setEditNextInspection(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingSlope(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold"
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
