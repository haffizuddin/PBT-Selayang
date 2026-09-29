import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { Slope, SlopeStatus } from '../types/slope';
import { Search, Navigation, X, Maximize } from 'lucide-react';
import { SlopeQuickView } from './SlopeQuickView';

interface InteractiveMapProps {
  slopes: Slope[];
  selectedSlope: Slope | null;
  onSelectSlope: (slope: Slope | null) => void;
  onReportSlope: (slope: Slope) => void;
  onViewQRSignboard: (slope: Slope) => void;
}

export const STATUS_COLORS: Record<SlopeStatus, string> = {
  Normal: '#10b981',
  Pemantauan: '#eab308',
  Perhatian: '#f97316',
  'Risiko Tinggi': '#ef4444',
};

// Leaflet's zoom-animation timer still fires after map.remove() and throws
// "_leaflet_pos" when the view unmounts mid-zoom; neutralise it first.
export function safeRemove(map: L.Map) {
  map.stop();
  (map as unknown as { _onZoomTransitionEnd: () => void })._onZoomTransitionEnd = () => {};
  map.remove();
}

const STATUSES: SlopeStatus[] = ['Risiko Tinggi', 'Perhatian', 'Pemantauan', 'Normal'];
const MPS_CENTRE: [number, number] = [3.255, 101.665];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  slopes,
  onSelectSlope,
  onReportSlope,
  onViewQRSignboard,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userLocationMarkerRef = useRef<L.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<SlopeStatus | 'Semua'>('Semua');
  const [userLocationActive, setUserLocationActive] = useState(false);
  const [quickSlope, setQuickSlope] = useState<Slope | null>(null);

  // Keep latest callbacks for marker clicks without rebuilding markers
  const handlersRef = useRef({ onSelectSlope, onReportSlope, onViewQRSignboard });
  handlersRef.current = { onSelectSlope, onReportSlope, onViewQRSignboard };

  const filteredSlopes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return slopes.filter((slope) => {
      const matchSearch =
        !q ||
        [slope.id, slope.gis?.idCerun ?? '', slope.location, slope.name].some((v) => v.toLowerCase().includes(q));
      const matchStatus = selectedStatus === 'Semua' || slope.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [slopes, searchQuery, selectedStatus]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { Semua: slopes.length };
    STATUSES.forEach((st) => (c[st] = slopes.filter((s) => s.status === st).length));
    return c;
  }, [slopes]);

  const fitAll = (list: Slope[], animate = true) => {
    const map = mapInstanceRef.current;
    if (!map || list.length === 0) return;
    const pad = window.innerWidth < 640 ? 24 : 60;
    map.fitBounds(L.latLngBounds(list.map((s) => s.coordinates)), { padding: [pad, pad], maxZoom: 15, animate });
  };

  // Initialise map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: MPS_CENTRE,
      zoom: 12,
      minZoom: 9,
      maxZoom: 18,
      zoomControl: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    fitAll(slopes, false);

    return () => {
      safeRemove(map);
      mapInstanceRef.current = null;
    };
  }, []);

  // Markers + popups
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();

    filteredSlopes.forEach((slope) => {
      const [lat, lng] = slope.coordinates.map(Number);
      if (!isFinite(lat) || !isFinite(lng)) return;

      const color = STATUS_COLORS[slope.status];
      const urgent = slope.status === 'Risiko Tinggi';
      const chosen = quickSlope?.id === slope.id;
      const icon = L.divIcon({
        html: `<span class="slope-pin${urgent ? ' slope-pin--urgent' : ''}${chosen ? ' slope-pin--chosen' : ''}" style="--pin:${color}">${urgent ? '!' : ''}</span>`,
        className: 'slope-pin-wrap',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -12],
      });

      const marker = L.marker([lat, lng], { icon, title: slope.gis?.idCerun ?? slope.id });
      marker.on('click', () => {
        handlersRef.current.onSelectSlope(slope);
        setQuickSlope(slope);
      });
      marker.addTo(layer);
    });
  }, [filteredSlopes, quickSlope]);

  const handleLocateMe = () => {
    const place = (coords: [number, number]) => {
      const map = mapInstanceRef.current;
      if (!map) return;
      userLocationMarkerRef.current?.remove();
      userLocationMarkerRef.current = L.marker(coords, {
        icon: L.divIcon({ html: '<span class="user-pin"></span>', className: 'slope-pin-wrap', iconSize: [18, 18], iconAnchor: [9, 9] }),
      }).addTo(map);
      setUserLocationActive(true);
      map.flyTo(coords, 14, { duration: 0.8 });
    };
    if (!navigator.geolocation) return place(MPS_CENTRE);
    navigator.geolocation.getCurrentPosition(
      (pos) => place([pos.coords.latitude, pos.coords.longitude]),
      () => place(MPS_CENTRE),
      { timeout: 5000, maximumAge: 60000 }
    );
  };

  return (
    <div className="relative isolate w-full h-[calc(100dvh-3.5rem)] overflow-hidden bg-slate-100">
      {/* Search + status chips (the chips double as the colour legend) */}
      <div className="absolute top-3 left-3 right-3 md:right-auto md:w-[500px] z-[500] space-y-2">
        <label className="bg-white rounded-xl shadow-md border border-slate-200 px-3 py-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ID cerun atau nama jalan"
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600" aria-label="Kosongkan carian">
              <X className="w-4 h-4" />
            </button>
          )}
        </label>
        <div className="flex flex-wrap md:flex-nowrap md:w-max gap-1.5">
          {(['Semua', ...STATUSES] as const).map((st) => {
            const active = selectedStatus === st;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-sm border ${
                  active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'
                }`}
              >
                {st !== 'Semua' && <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[st] }} />}
                {st} <span className={active ? 'text-slate-300' : 'text-slate-400'}>{counts[st]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="absolute top-3 right-3 z-[500] hidden md:flex flex-col gap-2">
        <MapButton onClick={handleLocateMe} active={userLocationActive} label="Lokasi saya">
          <Navigation className="w-4 h-4" />
        </MapButton>
        <MapButton onClick={() => fitAll(filteredSlopes)} label="Tunjuk semua cerun">
          <Maximize className="w-4 h-4" />
        </MapButton>
      </div>
      <div className="absolute bottom-24 right-3 z-[500] md:hidden">
        <MapButton onClick={handleLocateMe} active={userLocationActive} label="Lokasi saya">
          <Navigation className="w-4 h-4" />
        </MapButton>
      </div>

      {filteredSlopes.length === 0 && (
        <div className="absolute inset-x-0 top-32 z-[500] mx-auto w-fit bg-white rounded-xl shadow px-4 py-2 text-sm text-slate-600">
          Tiada cerun sepadan.
        </div>
      )}

      <div ref={mapContainerRef} className="w-full h-full" />

      {quickSlope && (
        <SlopeQuickView
          slope={quickSlope}
          onClose={() => setQuickSlope(null)}
          onReport={(s) => {
            setQuickSlope(null);
            onReportSlope(s);
          }}
          onShowQR={(s) => {
            setQuickSlope(null);
            onViewQRSignboard(s);
          }}
        />
      )}
    </div>
  );
};

const MapButton: React.FC<{ onClick: () => void; label: string; active?: boolean; children: React.ReactNode }> = ({
  onClick,
  label,
  active,
  children,
}) => (
  <button
    onClick={onClick}
    title={label}
    aria-label={label}
    className={`w-10 h-10 grid place-items-center rounded-xl shadow-md border ${
      active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
    }`}
  >
    {children}
  </button>
);
