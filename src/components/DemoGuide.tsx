import React, { useState } from 'react';
import { ViewMode } from '../types/slope';
import { ChevronLeft, ChevronRight, Minus, Sparkles } from 'lucide-react';

interface DemoGuideProps {
  currentView: ViewMode;
  onJumpToStep: (stepNumber: number) => void;
}

export const DEMO_STEPS: { num: number; title: string; desc: string; views: ViewMode[] }[] = [
  { num: 1, title: 'Peta cerun', desc: 'Semua cerun MPS. Klik titik untuk lihat maklumat & lapor.', views: ['map'] },
  { num: 2, title: 'Profil cerun', desc: 'Halaman yang dibuka bila orang awam imbas QR di tapak.', views: ['slope-detail'] },
  { num: 3, title: 'Buat aduan', desc: 'Borang lapor masalah cerun, tanpa perlu daftar akaun.', views: ['report-issue'] },
  { num: 4, title: 'Semak aduan', desc: 'Jejak status aduan guna nombor rujukan.', views: ['report-success', 'track-report'] },
  { num: 5, title: 'Kod QR', desc: 'Plat QR contoh untuk dicetak dan diimbas.', views: ['qr-gallery'] },
  { num: 6, title: 'Portal MPS', desc: 'Dashboard pegawai untuk urus aduan & daftar cerun.', views: ['admin-dashboard', 'admin-slopes'] },
];

const STORAGE_KEY = 'demoGuideOpen';

function initialOpen(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return saved === '1';
  } catch {
    /* storage unavailable */
  }
  return window.innerWidth >= 1024; // open on desktop, tucked away on phones
}

export const DemoGuide: React.FC<DemoGuideProps> = ({ currentView, onJumpToStep }) => {
  const [open, setOpenState] = useState(initialOpen);
  const setOpen = (v: boolean) => {
    setOpenState(v);
    try {
      localStorage.setItem(STORAGE_KEY, v ? '1' : '0');
    } catch {
      /* storage unavailable */
    }
  };

  const current = DEMO_STEPS.find((s) => s.views.includes(currentView))?.num ?? 1;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-4 z-[900] flex items-center gap-2 rounded-full bg-slate-900 text-white pl-3 pr-4 py-2.5 text-sm font-semibold shadow-lg"
      >
        <Sparkles className="w-4 h-4 text-amber-400" />
        Panduan demo <span className="text-amber-400">{current}/6</span>
      </button>
    );
  }

  return (
    <aside className="fixed bottom-4 left-4 z-[900] w-[min(300px,calc(100vw-2rem))] rounded-2xl bg-slate-900 text-white shadow-2xl">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="w-4 h-4 text-amber-400" /> Panduan demo
        </span>
        <button onClick={() => setOpen(false)} className="p-1 text-slate-400 hover:text-white" aria-label="Kecilkan panduan">
          <Minus className="w-4 h-4" />
        </button>
      </div>

      <ol className="px-2">
        {DEMO_STEPS.map((step) => {
          const active = step.num === current;
          return (
            <li key={step.num}>
              <button
                onClick={() => onJumpToStep(step.num)}
                aria-current={active ? 'step' : undefined}
                className={`w-full flex items-start gap-2.5 rounded-lg px-2 py-1.5 text-left ${active ? 'bg-amber-400 text-slate-950' : 'hover:bg-slate-800'}`}
              >
                <span
                  className={`mt-0.5 w-5 h-5 shrink-0 rounded-full grid place-items-center text-[11px] font-bold ${
                    active ? 'bg-slate-950 text-amber-400' : step.num < current ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  {step.num}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold">{step.title}</span>
                  {active && <span className="block text-xs text-slate-800">{step.desc}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-2 gap-2 p-3">
        <button
          onClick={() => onJumpToStep(current - 1)}
          disabled={current === 1}
          className="flex items-center justify-center gap-1 rounded-lg bg-slate-800 py-2 text-xs font-semibold disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" /> Sebelum
        </button>
        <button
          onClick={() => onJumpToStep(current + 1)}
          disabled={current === 6}
          className="flex items-center justify-center gap-1 rounded-lg bg-amber-400 text-slate-950 py-2 text-xs font-semibold disabled:opacity-40"
        >
          Seterusnya <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
