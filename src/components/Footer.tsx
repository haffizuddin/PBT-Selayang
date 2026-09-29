import React from 'react';
import { ShieldCheck, PhoneCall, AlertCircle, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenEmergencyModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenEmergencyModal }) => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-sm mt-auto">
      {/* Top Banner with PBT & Selangor Assurance */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: System info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                SGR
              </div>
              <span className="font-bold text-slate-100 text-base">
                Sistem Informasi & Aduan Cerun (SIAC)
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400 max-w-md">
              Inisiatif pendigitalan pengurusan cerun Pihak Berkuasa Tempatan (PBT) Negeri Selangor. 
              Menyediakan identiti digital berpusat, pendaftaran QR unik di setiap lokasi fizikal cerun, dan saluran pantas aduan awam bagi mengurangkan risiko tanah runtuh.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sistem Keselamatan Awam & Geoteknikal Komuniti</span>
            </div>
          </div>

          {/* Col 2: Emergency Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Talian Kecemasan Bencana
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center justify-between py-1 border-b border-slate-800">
                <span>Talian Kecemasan Malaysia:</span>
                <span className="text-red-400 font-bold font-mono">999</span>
              </li>
              <li className="flex items-center justify-between py-1 border-b border-slate-800">
                <span>Bilik Gerakan Bencana SGR:</span>
                <span className="text-slate-200 font-mono">03-5544 7000</span>
              </li>
              <li className="flex items-center justify-between py-1">
                <span>Bomba & Penyelamat:</span>
                <span className="text-slate-200 font-mono">994</span>
              </li>
            </ul>
            <button
              onClick={onOpenEmergencyModal}
              className="w-full text-center px-3 py-1.5 bg-red-950/60 border border-red-800/80 hover:bg-red-900/60 text-red-200 rounded text-xs font-medium transition-colors"
            >
              Panduan Keselamatan & Tanda Bahaya
            </button>
          </div>

          {/* Col 3: PBT Network */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              PBT Terlibat
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              MBSA (Shah Alam) · MPAJ (Ampang Jaya) · MPS (Selayang) · MPKj (Kajang) · MBPJ (Petaling Jaya) · MBDK (Klang) · MBSJ (Subang Jaya) · MPKS · MPSepang
            </p>
            <div className="pt-2 text-[11px] text-slate-500">
              Kerjasama Cawangan Kejuruteraan Cerun JKR & PBT Selangor
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="border-t border-slate-800/80 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div>
            © 2026 Kerajaan Negeri Selangor. Hak Cipta Terpelihara.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Penafian: Prototaip Pengesahan Konsep (Proof of Concept)</span>
            <span>·</span>
            <span>Bahasa Melayu Rasmi</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
