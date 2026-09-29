import React from 'react';

interface FooterProps {
  onOpenEmergencyModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenEmergencyModal }) => (
  <footer className="bg-slate-900 text-slate-400 text-xs mt-auto">
    <div className="max-w-5xl mx-auto px-4 py-5 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
      <p>
        <span className="text-slate-200 font-semibold">Cerun MPS</span> · Majlis Perbandaran Selayang · Prototaip demo, bukan laman rasmi
      </p>
      <p>
        Kecemasan <b className="text-white">999</b> · Talian MPS <b className="text-white">03-6126 5800</b> ·{' '}
        <button onClick={onOpenEmergencyModal} className="underline hover:text-white">
          Panduan keselamatan
        </button>
      </p>
    </div>
  </footer>
);
