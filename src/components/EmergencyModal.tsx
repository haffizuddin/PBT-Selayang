import React from 'react';
import { X, PhoneCall, AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface EmergencyModalProps {
  onClose: () => void;
  onOpenReportForm: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ onClose, onOpenReportForm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-red-200 overflow-hidden my-6">
        {/* Top Emergency Red Header */}
        <div className="bg-red-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">
                  Tanda Bahaya Cerun & Talian Kecemasan
                </h3>
                <p className="text-xs text-red-100">
                  Panduan Tindakan Kecemasan Awam Negeri Selangor
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-red-200 hover:text-white p-1 rounded-lg hover:bg-red-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[75vh] overflow-y-auto">
          {/* Critical Hotline Box */}
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 text-center">
            <span className="text-[11px] uppercase font-bold text-red-800 block mb-1">
              Untuk Ancaman Nyawa, Runtuhan Aktif & Kecemasan Segera
            </span>
            <div className="text-3xl font-black font-mono text-red-700 tracking-wider my-1">
              999
            </div>
            <p className="text-[11px] text-red-900 font-medium">
              Talian Kecemasan Malaysia (Polis, Bomba & Pertahanan Awam APM)
            </p>

            <div className="mt-3 pt-3 border-t border-red-200 grid grid-cols-2 gap-2 text-[11px] text-left font-semibold">
              <div className="bg-white p-2 rounded-lg border border-red-200">
                <span className="text-slate-500 block text-[10px]">Pusat Kawalan Bencana SGR</span>
                <span className="text-slate-900 font-mono font-bold">03-5544 7000</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-red-200">
                <span className="text-slate-500 block text-[10px]">Jabatan Bomba (Tanah Runtuh)</span>
                <span className="text-slate-900 font-mono font-bold">994</span>
              </div>
            </div>
          </div>

          {/* 5 Signs of Slope Hazard */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs">
              5 Tanda Awal Bahaya Pada Cerun:
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                <div>
                  <strong className="text-slate-900">Retakan tanah atau dinding:</strong> Rekahan yang melebar secara tiba-tiba di permukaan tanah atau struktur penahan.
                </div>
              </li>
              <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                <div>
                  <strong className="text-slate-900">Air keluar luar biasa:</strong> Air keruh membuak keluar dari lereng bukit atau dinding cerun.
                </div>
              </li>
              <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                <div>
                  <strong className="text-slate-900">Batu atau tanah jatuh:</strong> Guguran serpihan batuan berulang kali terutamanya semasa hujan lebat.
                </div>
              </li>
              <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[10px]">4</span>
                <div>
                  <strong className="text-slate-900">Objek condong:</strong> Pokok, pagar, tiang elektrik, atau tembok kelihatan condong ke arah cerun.
                </div>
              </li>
              <li className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 text-[10px]">5</span>
                <div>
                  <strong className="text-slate-900">Bunyi gemuruh bawah tanah:</strong> Sebarang bunyi geseran tanah atau retakan struktur konkrit.
                </div>
              </li>
            </ul>
          </div>

          {/* Action button */}
          <div className="pt-2 border-t border-slate-200 flex flex-col gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenReportForm();
              }}
              className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span>Buka Saluran Laporan Aduan Awam PBT</span>
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
