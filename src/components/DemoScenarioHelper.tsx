import React, { useState } from 'react';
import { ViewMode } from '../types/slope';
import { Sparkles, Check, ChevronRight, Play, Info, X } from 'lucide-react';

interface DemoScenarioHelperProps {
  currentView: ViewMode;
  onJumpToStep: (stepNumber: number) => void;
  onClose?: () => void;
}

export const DemoScenarioHelper: React.FC<DemoScenarioHelperProps> = ({
  currentView,
  onJumpToStep,
  onClose
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Peta & Lokasi',
      desc: 'Peta GIS MPS & Cerun MPS-SEL-0012',
      viewKey: 'map'
    },
    {
      num: 2,
      title: 'Profil & QR',
      desc: 'Maklumat Cerun & Papan Tanda QR MPS-SEL-0012',
      viewKey: 'slope-detail'
    },
    {
      num: 3,
      title: 'Borang Aduan',
      desc: 'Lapor Masalah: Saliran Daun & Foto Tapak',
      viewKey: 'report-issue'
    },
    {
      num: 4,
      title: 'Pengesahan',
      desc: 'Penjanaan Rujukan RPT-2026-00821',
      viewKey: 'report-success'
    },
    {
      num: 5,
      title: '10 Kod QR',
      desc: 'Koleksi 10 Unit Sampel QR MPS',
      viewKey: 'qr-gallery'
    },
    {
      num: 6,
      title: 'Portal MPS',
      desc: 'Dashboard Tindakan Jurutera Cawangan Cerun',
      viewKey: 'admin-dashboard'
    }
  ];

  if (collapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setCollapsed(false)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-xl shadow-lg border border-amber-600 flex items-center gap-2 text-xs transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Panduan Senario Ujian (MPS-SEL-0012)</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm w-full bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white rounded-2xl shadow-2xl p-4 text-xs transition-all">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-amber-400">Senario Demo Utama (MPS Selayang)</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCollapsed(true)}
            className="text-slate-400 hover:text-white p-1 rounded-md"
            title="Kecilkan panduan"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
        Cerun <strong>MPS-SEL-0012</strong> (Selayang Heights, MPS). Klik mana-mana langkah untuk melompat terus ke fasa aliran:
      </p>

      {/* Step Selector Buttons */}
      <div className="grid grid-cols-3 gap-1.5 mt-3">
        {steps.map((st) => {
          const isActive = currentView === st.viewKey;
          return (
            <button
              key={st.num}
              onClick={() => onJumpToStep(st.num)}
              className={`p-2 rounded-xl text-left border transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-xs'
                  : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="opacity-75 font-mono">0{st.num}</span>
                {isActive && <Check className="w-3 h-3 text-slate-950" />}
              </div>
              <div className="font-semibold text-[11px] truncate mt-0.5">{st.title}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
