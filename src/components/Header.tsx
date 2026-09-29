import React from 'react';
import { ViewMode } from '../types/slope';
import { ShieldAlert, QrCode, Map, Search, LayoutDashboard, AlertTriangle, PhoneCall } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenQRScanner: () => void;
  onTriggerDemoScenario: () => void;
  onOpenEmergencyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onOpenQRScanner,
  onTriggerDemoScenario,
  onOpenEmergencyModal
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top Malaysian PBT Bar */}
      <div className="bg-amber-500 text-slate-950 text-xs px-4 py-1 font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
          <span>PORTAL RASMI MAJLIS PERBANDARAN SELAYANG (MPS) · DAERAH GOMBAK</span>
          <span className="hidden md:inline text-amber-950 font-normal">| Cawangan Cerun & Geoteknikal</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <button 
            onClick={onTriggerDemoScenario}
            className="hover:underline flex items-center gap-1 bg-amber-400/90 hover:bg-amber-300 px-2 py-0.5 rounded text-amber-950 font-bold transition-colors"
            title="Klik untuk memulakan senario utama MPS-SEL-0012 (Selayang Heights)"
          >
            <span>★ Jalankan Senario Demo (MPS-SEL-0012)</span>
          </button>
          <button
            onClick={onOpenEmergencyModal}
            className="hidden sm:flex items-center gap-1 hover:text-red-950 font-bold text-red-900"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Talian Aduan MPS: 03-6126 5800 / 999</span>
          </button>
        </div>
      </div>

      {/* Main 3-Zone Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand & Identity */}
        <div 
          onClick={() => onNavigate('map')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* MPS Shield Emblem Graphic */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-amber-500 to-amber-600 p-0.5 shadow-sm flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-amber-400 font-extrabold text-xs tracking-tight">
              <span className="text-red-500 font-black mr-0.5">M</span>
              <span className="text-amber-400 font-black">PS</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                Sistem Informasi & Aduan Cerun
              </span>
              <span className="hidden lg:inline-block bg-amber-500/20 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded border border-amber-500/30">
                MPS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Majlis Perbandaran Selayang · Cawangan Cerun & Geoteknikal Daerah Gombak
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm font-medium">
          <button
            onClick={() => onNavigate('map')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              currentView === 'map' || currentView === 'slope-detail'
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Map className="w-4 h-4" />
            <span>Peta Cerun MPS</span>
          </button>

          {/* New Tab: Koleksi 10 QR Cerun (as requested: "appearkan tab list 10 unit qr, untuk sample2 cerun") */}
          <button
            onClick={() => onNavigate('qr-gallery')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 relative ${
              currentView === 'qr-gallery'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
            title="Senarai 10 Unit Sampel Kod QR Cerun Berdaftar MPS"
          >
            <QrCode className="w-4 h-4" />
            <span>Koleksi 10 QR Cerun</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
              currentView === 'qr-gallery' ? 'bg-slate-950 text-amber-400' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              10 Unit
            </span>
          </button>

          {/* NOTE: "Jejak Aduan" is hidden from main menu as requested ("hide dulu jejak aduan") */}

          <button
            onClick={() => onNavigate('admin-dashboard')}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              currentView === 'admin-dashboard' || currentView === 'admin-slopes'
                ? 'bg-slate-800 text-amber-400 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Portal Pegawai MPS</span>
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          {/* Quick QR Scanner Simulator */}
          <button
            onClick={onOpenQRScanner}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 rounded-lg text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Simulasi imbasan kamera telefon pintar pada papan tanda cerun MPS"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Simulasi Imbas QR</span>
          </button>

          {/* Quick Emergency / Hazard notice */}
          <button
            onClick={onOpenEmergencyModal}
            className="flex items-center gap-1.5 px-3 py-2 bg-red-600/90 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-colors active:scale-95"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden lg:inline">Tanda Bahaya</span>
          </button>
        </div>
      </div>

      {/* Mobile Subnav for smaller screens */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800 bg-slate-900/95 py-2 px-2 text-xs">
        <button
          onClick={() => onNavigate('map')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded ${
            currentView === 'map' || currentView === 'slope-detail' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Map className="w-4 h-4" />
          <span>Peta MPS</span>
        </button>

        <button
          onClick={() => onNavigate('qr-gallery')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded ${
            currentView === 'qr-gallery' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>10 Kod QR</span>
        </button>

        <button
          onClick={() => onNavigate('admin-dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded ${
            currentView === 'admin-dashboard' || currentView === 'admin-slopes' ? 'text-amber-400 font-bold' : 'text-slate-400'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Portal MPS</span>
        </button>
      </div>
    </header>
  );
};
