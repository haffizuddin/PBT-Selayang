import React from 'react';
import { QrCode, Phone } from 'lucide-react';

interface HeaderProps {
  onGoHome: () => void;
  onOpenQRScanner: () => void;
  onOpenEmergencyModal: () => void;
}

// Navigation lives in the floating demo guide; the header only carries the two actions
export const Header: React.FC<HeaderProps> = ({ onGoHome, onOpenQRScanner, onOpenEmergencyModal }) => (
  <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md">
    <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
      <button onClick={onGoHome} className="flex items-center gap-2.5 shrink-0" title="Kembali ke peta">
        <span className="w-9 h-9 rounded-lg bg-amber-400 text-slate-950 grid place-items-center font-black text-xs">MPS</span>
        <span className="text-left leading-tight">
          <span className="block font-bold text-sm">Cerun MPS</span>
          <span className="block text-[11px] text-slate-400">Majlis Perbandaran Selayang</span>
        </span>
      </button>

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
  </header>
);
