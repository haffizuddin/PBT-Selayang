import React, { useEffect } from 'react';
import { Slope } from '../types/slope';
import { STATUS_COLORS } from './InteractiveMap';
import { slopeKeyFacts, slopeFullDetails, isSevere } from '../utils/slopeFacts';
import { X, AlertTriangle, QrCode } from 'lucide-react';

interface SlopeQuickViewProps {
  slope: Slope;
  onClose: () => void;
  onReport: (slope: Slope) => void;
  onShowQR: (slope: Slope) => void;
}

// Long free-text fields get the full width (two lines max)
const WIDE_FIELDS = new Set(['Nama jalan', 'Zon ahli majlis', 'Blok perancangan', 'Struktur', 'Catatan']);

// Centred modal opened by clicking a map pin: the whole record, two actions, no photo
export const SlopeQuickView: React.FC<SlopeQuickViewProps> = ({ slope, onClose, onReport, onShowQR }) => {
  const color = STATUS_COLORS[slope.status];
  const displayId = slope.gis?.idCerun ?? slope.id;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[950] grid place-items-center bg-slate-950/40 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="slope-quick-title"
        className="w-full max-w-sm max-h-[calc(100dvh-2rem)] flex flex-col rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start gap-3 px-5 pt-5 pb-3 border-b border-slate-100">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 id="slope-quick-title" className="font-mono text-lg font-bold text-slate-900">
                {displayId}
              </h2>
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                style={{ color, background: `${color}1a`, borderColor: `${color}66` }}
              >
                {slope.status}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              {slope.location}
              {slope.coordinatesApprox && <span className="text-xs text-slate-400"> · lokasi anggaran</span>}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 -mr-1.5 -mt-1 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100" aria-label="Tutup">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sized to fit a small phone without scrolling; scroll only as a last resort */}
        <div className="overflow-y-auto px-5 py-3">
          <dl className="grid grid-cols-2 gap-1.5">
            {slopeKeyFacts(slope).map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 px-2.5 py-1">
                <dt className="text-[10.5px] text-slate-500">{label}</dt>
                <dd className={`text-[13px] font-semibold truncate ${isSevere(value) ? 'text-red-700' : 'text-slate-900'}`}>{value || '-'}</dd>
              </div>
            ))}
          </dl>

          <dl className="grid grid-cols-2 gap-x-3 gap-y-2 mt-3">
            {slopeFullDetails(slope).map(([label, value]) => (
              <div key={label} className={WIDE_FIELDS.has(label) ? 'col-span-2' : ''}>
                <dt className="text-[10.5px] text-slate-500">{label}</dt>
                <dd className={`text-xs text-slate-900 ${WIDE_FIELDS.has(label) ? 'line-clamp-2' : 'truncate'}`} title={value}>
                  {value || '-'}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid grid-cols-2 gap-2 px-5 py-3 border-t border-slate-100">
          <button
            onClick={() => onReport(slope)}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2.5"
          >
            <AlertTriangle className="w-4 h-4" /> Lapor masalah
          </button>
          <button
            onClick={() => onShowQR(slope)}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 text-sm font-semibold py-2.5"
          >
            <QrCode className="w-4 h-4" /> Kod QR
          </button>
        </div>
      </div>
    </div>
  );
};
