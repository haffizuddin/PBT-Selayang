import React, { useEffect, useRef } from 'react';
import { ViewMode } from '../types/slope';
import { QrCode, Phone } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onJumpToStep: (stepNumber: number) => void;
  onOpenQRScanner: () => void;
  onOpenEmergencyModal: () => void;
}

// The demo walkthrough doubles as the main navigation
const STEPS: { num: number; label: string; views: ViewMode[] }[] = [
  { num: 1, label: 'Peta', views: ['map'] },
  { num: 2, label: 'Profil Cerun', views: ['slope-detail'] },
  { num: 3, label: 'Buat Aduan', views: ['report-issue'] },
  { num: 4, label: 'Semak Aduan', views: ['report-success', 'track-report'] },
  { num: 5, label: 'Kod QR', views: ['qr-gallery'] },
  { num: 6, label: 'Portal MPS', views: ['admin-dashboard', 'admin-slopes'] },
];

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onJumpToStep,
  onOpenQRScanner,
  onOpenEmergencyModal,
}) => {
  const stripRef = useRef<HTMLElement>(null);

  // Keep the active step visible in the scrollable strip on phones
  useEffect(() => {
    const strip = stripRef.current;
    const active = strip?.querySelector<HTMLElement>('[aria-current="step"]');
    if (!strip || !active) return;
    strip.scrollTo({ left: active.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2, behavior: 'smooth' });
  }, [currentView]);

  const steps = (
    <ol className="flex items-center gap-1">
      {STEPS.map((step) => {
        const active = step.views.includes(currentView);
        return (
          <li key={step.num} className="shrink-0">
            <button
              onClick={() => onJumpToStep(step.num)}
              aria-current={active ? 'step' : undefined}
              className={`flex items-center gap-1.5 rounded-full pl-1 pr-3 py-1 text-[13px] font-medium transition-colors ${
                active ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full grid place-items-center text-[11px] font-bold ${
                  active ? 'bg-slate-950 text-amber-400' : 'bg-slate-700 text-slate-200'
                }`}
              >
                {step.num}
              </span>
              {step.label}
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        <button onClick={() => onJumpToStep(1)} className="flex items-center gap-2.5 shrink-0" title="Kembali ke peta">
          <span className="w-9 h-9 rounded-lg bg-amber-400 text-slate-950 grid place-items-center font-black text-xs">MPS</span>
          <span className="text-left leading-tight">
            <span className="block font-bold text-sm">Cerun MPS</span>
            <span className="block text-[11px] text-slate-400">Majlis Perbandaran Selayang</span>
          </span>
        </button>

        <nav className="hidden lg:block flex-1 min-w-0" aria-label="Panduan demo">
          {steps}
        </nav>

        <div className="ml-auto flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenQRScanner}
            className="flex items-center gap-1.5 bg-white text-slate-900 hover:bg-amber-100 rounded-lg px-3 py-2 text-[13px] font-semibold"
          >
            <QrCode className="w-4 h-4" />
            <span>Imbas QR</span>
          </button>
          <button
            onClick={onOpenEmergencyModal}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 rounded-lg px-3 py-2 text-[13px] font-semibold"
            title="Kecemasan: hubungi 999 / Talian MPS 03-6126 5800"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">Kecemasan</span>
          </button>
        </div>
      </div>

      {/* Phones/tablets: the same steps as a scrollable strip */}
      <nav ref={stripRef} className="lg:hidden relative border-t border-slate-800 overflow-x-auto px-3 py-1.5" aria-label="Panduan demo">
        {steps}
      </nav>
    </header>
  );
};
