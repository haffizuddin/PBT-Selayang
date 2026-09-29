import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Slope } from '../types/slope';
import { generateSlopeQRDataUrl, getSlopePermanentUrl } from '../utils/qrHelper';
import { STATUS_COLORS, safeRemove } from './InteractiveMap';
import { ArrowLeft, AlertTriangle, Printer, Link2, Check, Phone, ChevronDown } from 'lucide-react';

interface SlopeDetailViewProps {
  slope: Slope;
  onBackToMap: () => void;
  onOpenReport: (slope: Slope) => void;
  onOpenSignboardModal: (slope: Slope) => void;
}

// Satellite view of the actual site — a real picture of the location rather than a stock photo
const SiteMap: React.FC<{ slope: Slope }> = ({ slope }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'satelit' | 'peta'>('satelit');
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<Record<string, L.TileLayer>>({});

  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { center: slope.coordinates, zoom: 17, zoomControl: true, scrollWheelZoom: false, attributionControl: true });
    layersRef.current = {
      satelit: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Imej &copy; Esri',
        maxZoom: 19,
      }),
      peta: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }),
    };
    layersRef.current.satelit.addTo(map);
    L.marker(slope.coordinates, {
      icon: L.divIcon({
        html: `<span class="slope-pin" style="--pin:${STATUS_COLORS[slope.status]}"></span>`,
        className: 'slope-pin-wrap',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      }),
    }).addTo(map);
    mapRef.current = map;
    return () => {
      safeRemove(map);
      mapRef.current = null;
    };
  }, [slope.id]);

  const switchTo = (next: 'satelit' | 'peta') => {
    const map = mapRef.current;
    if (!map || next === mode) return;
    layersRef.current[mode].remove();
    layersRef.current[next].addTo(map);
    setMode(next);
  };

  return (
    <div className="relative isolate rounded-2xl overflow-hidden border border-slate-200 bg-slate-200">
      <div className="h-56 sm:h-72">
        <div ref={ref} className="h-full" />
      </div>
      <div className="absolute top-3 right-3 z-[500] flex rounded-lg bg-white shadow text-xs font-semibold overflow-hidden">
        {(['satelit', 'peta'] as const).map((m) => (
          <button key={m} onClick={() => switchTo(m)} className={`px-3 py-1.5 capitalize ${mode === m ? 'bg-slate-900 text-white' : 'text-slate-700'}`}>
            {m}
          </button>
        ))}
      </div>
      {slope.coordinatesApprox && (
        <div className="absolute bottom-2 left-2 z-[500] rounded-md bg-white/90 px-2 py-1 text-[11px] text-slate-600">
          Lokasi anggaran
        </div>
      )}
    </div>
  );
};

export const SlopeDetailView: React.FC<SlopeDetailViewProps> = ({ slope, onBackToMap, onOpenReport, onOpenSignboardModal }) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const permanentUrl = getSlopePermanentUrl(slope.id);
  const displayId = slope.gis?.idCerun ?? slope.id;
  const color = STATUS_COLORS[slope.status];

  useEffect(() => {
    generateSlopeQRDataUrl(slope.id).then(setQrDataUrl);
  }, [slope.id]);

  const copyLink = () => {
    navigator.clipboard?.writeText(permanentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // The handful of facts a member of the public actually needs
  const keyFacts: [string, string][] = slope.gis
    ? [
        ['Tahap risiko', slope.gis.tahapRisiko],
        ['Tahap bahaya', slope.gis.tahapBahaya],
        ['Tinggi', `${slope.gis.tinggi} m`],
        ['Kelas kecerunan', slope.gis.kelasKecerunan],
        ['Diselenggara oleh', slope.gis.agensi],
        ['Kawasan', slope.gis.blokPerancanganKecil.split(':')[1]?.trim() || slope.gis.blokPerancanganKecil],
      ]
    : [
        ['Tahap risiko', slope.riskLevel],
        ['Tinggi', `${slope.height} m`],
        ['Kecerunan', `${slope.gradient}°`],
        ['Jenis', slope.slopeType],
        ['Pemeriksaan terakhir', slope.lastInspection],
        ['Pemeriksaan seterusnya', slope.nextInspection],
      ];

  const fullDetails: [string, string][] = slope.gis
    ? [
        ['ID cerun', slope.gis.idCerun],
        ['ID JMG', slope.gis.idJmg],
        ['Nama jalan', slope.gis.namaJalan],
        ['Zon ahli majlis', slope.gis.zonAhliMajlis],
        ['Blok perancangan', slope.gis.blokPerancangan],
        ['Blok perancangan kecil', slope.gis.blokPerancanganKecil],
      ]
    : [
        ['Kestabilan', slope.condition.stability],
        ['Saliran', slope.condition.drainage],
        ['Hakisan permukaan', slope.condition.surfaceErosion],
        ['Retakan', slope.condition.cracks],
        ['Tumbuhan', slope.condition.vegetation],
        ['Pergerakan tanah', slope.condition.groundMovement],
        ['Struktur', slope.condition.structureType],
        ['Catatan', slope.condition.notes],
      ];

  return (
    <div className="bg-slate-100 pb-12">
      <div className="max-w-5xl mx-auto px-4 pt-4 space-y-4">
        <button onClick={onBackToMap} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Kembali ke peta
        </button>

        {/* Who / where / how risky, and the one thing to do */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-mono text-2xl font-bold text-slate-900">{displayId}</h1>
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                style={{ color, background: `${color}1a`, borderColor: `${color}66` }}
              >
                {slope.status}
              </span>
            </div>
            <p className="text-slate-700 mt-1">{slope.location}</p>
            <p className="text-xs text-slate-500 mt-0.5">{slope.pbt}</p>
          </div>
          <button
            onClick={() => onOpenReport(slope)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl px-5 py-3 flex items-center justify-center gap-2 shrink-0"
          >
            <AlertTriangle className="w-5 h-5" /> Lapor masalah cerun
          </button>
        </section>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <SiteMap slope={slope} />

            <section className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Maklumat utama</h2>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {keyFacts.map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 px-3 py-2.5">
                    <dt className="text-[11px] text-slate-500">{label}</dt>
                    <dd className={`text-sm font-semibold ${/SANGAT TINGGI|Kritikal/i.test(value) ? 'text-red-700' : 'text-slate-900'}`}>{value || '-'}</dd>
                  </div>
                ))}
              </dl>

              <details className="group mt-4 border-t border-slate-100 pt-3">
                <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-slate-700 list-none">
                  {slope.gis ? 'Rekod penuh Geoportal MPS' : 'Keadaan fizikal cerun'}
                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                </summary>
                <dl className="mt-2 text-sm">
                  {fullDetails.map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4 py-2 border-b border-slate-100 last:border-0">
                      <dt className="text-slate-500 shrink-0">{label}</dt>
                      <dd className="text-slate-900 text-right">{value || '-'}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </section>
          </div>

          {/* QR */}
          <aside className="bg-white rounded-2xl border border-slate-200 p-5 text-center h-fit">
            <h2 className="text-sm font-semibold text-slate-900">Kod QR cerun ini</h2>
            <p className="text-xs text-slate-500 mt-1">Dilekat pada plat di tapak. Imbas untuk buka halaman ini.</p>
            {qrDataUrl && <img src={qrDataUrl} alt={`Kod QR ${displayId}`} className="w-44 h-44 mx-auto my-3" />}
            <p className="font-mono text-[11px] text-slate-500 break-all">{permanentUrl}</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => onOpenSignboardModal(slope)}
                className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold py-2.5"
              >
                <Printer className="w-4 h-4" /> Plat QR
              </button>
              <button
                onClick={copyLink}
                className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold py-2.5"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4" />}
                {copied ? 'Disalin' : 'Salin pautan'}
              </button>
            </div>
          </aside>
        </div>

        <p className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900">
          <Phone className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Nampak tanah runtuh, retakan besar atau batu jatuh? Jauhkan diri dan hubungi <b>999</b> atau talian MPS <b>03-6126 5800</b>.
          </span>
        </p>
      </div>
    </div>
  );
};
