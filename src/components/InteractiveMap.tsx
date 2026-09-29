import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { Slope, SlopeStatus } from '../types/slope';
import { DISTRICTS, PBTS } from '../data/mockSlopes';
import { Search, MapPin, Filter, Navigation, ArrowRight, AlertTriangle, ShieldCheck, QrCode, X, Layers } from 'lucide-react';

interface InteractiveMapProps {
  slopes: Slope[];
  selectedSlope: Slope | null;
  onSelectSlope: (slope: Slope | null) => void;
  onViewSlopeDetail: (slope: Slope) => void;
  onReportSlope: (slope: Slope) => void;
  onViewQRSignboard: (slope: Slope) => void;
  initialSearchQuery?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  slopes,
  selectedSlope,
  onSelectSlope,
  onViewSlopeDetail,
  onReportSlope,
  onViewQRSignboard,
  initialSearchQuery = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});
  const userLocationMarkerRef = useRef<L.Marker | null>(null);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedDistrict, setSelectedDistrict] = useState('Semua Daerah');
  const [selectedPBT, setSelectedPBT] = useState('Semua PBT');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [userLocationActive, setUserLocationActive] = useState(false);

  // Status color mapper helper
  const getStatusColor = (status: SlopeStatus) => {
    switch (status) {
      case 'Normal':
        return {
          bg: '#10b981', // emerald-500
          border: '#047857',
          ring: 'rgba(16, 185, 129, 0.4)',
          text: 'text-emerald-700',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        };
      case 'Pemantauan':
        return {
          bg: '#eab308', // yellow-500
          border: '#a16207',
          ring: 'rgba(234, 179, 8, 0.4)',
          text: 'text-yellow-700',
          badgeBg: 'bg-yellow-50 text-yellow-800 border-yellow-200'
        };
      case 'Perhatian':
        return {
          bg: '#f97316', // orange-500
          border: '#c2410c',
          ring: 'rgba(249, 115, 22, 0.4)',
          text: 'text-orange-700',
          badgeBg: 'bg-orange-50 text-orange-800 border-orange-200'
        };
      case 'Risiko Tinggi':
        return {
          bg: '#ef4444', // red-500
          border: '#b91c1c',
          ring: 'rgba(239, 68, 68, 0.5)',
          text: 'text-red-700',
          badgeBg: 'bg-red-50 text-red-800 border-red-200'
        };
      default:
        return {
          bg: '#64748b',
          border: '#334155',
          ring: 'rgba(100, 116, 139, 0.4)',
          text: 'text-slate-700',
          badgeBg: 'bg-slate-50 text-slate-700 border-slate-200'
        };
    }
  };

  // Filtered slopes
  const filteredSlopes = useMemo(() => {
    return slopes.filter((slope) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        slope.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slope.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slope.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        slope.district.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDistrict =
        selectedDistrict === 'Semua Daerah' || slope.district === selectedDistrict;

      const matchPBT =
        selectedPBT === 'Semua PBT' || slope.pbt === selectedPBT;

      const matchStatus =
        selectedStatus === 'Semua' || slope.status === selectedStatus;

      return matchSearch && matchDistrict && matchPBT && matchStatus;
    });
  }, [slopes, searchQuery, selectedDistrict, selectedPBT, selectedStatus]);

  // Counts for legend
  const counts = useMemo(() => {
    return {
      total: slopes.length,
      normal: slopes.filter((s) => s.status === 'Normal').length,
      pemantauan: slopes.filter((s) => s.status === 'Pemantauan').length,
      perhatian: slopes.filter((s) => s.status === 'Perhatian').length,
      risikoTinggi: slopes.filter((s) => s.status === 'Risiko Tinggi').length
    };
  }, [slopes]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Selayang / MPS center coordinates approx [3.255, 101.655]
    const map = L.map(mapContainerRef.current, {
      center: [3.255, 101.655],
      zoom: 12,
      minZoom: 9,
      maxZoom: 18,
      zoomControl: false
    });

    // Clean OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    // Zoom controls on bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when filteredSlopes change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    filteredSlopes.forEach((slope) => {
      // Validate coordinates to prevent Leaflet "Invalid LatLng object: (NaN, NaN)"
      const lat = Number(slope.coordinates?.[0]);
      const lng = Number(slope.coordinates?.[1]);
      if (isNaN(lat) || isNaN(lng) || !isFinite(lat) || !isFinite(lng)) {
        return;
      }
      const validCoords: [number, number] = [lat, lng];

      const colors = getStatusColor(slope.status);
      const isSelected = selectedSlope?.id === slope.id;
      const isUrgent = slope.status === 'Risiko Tinggi' || slope.status === 'Pemantauan';

      // Custom HTML Marker Icon
      const pulseClass =
        slope.status === 'Risiko Tinggi'
          ? 'marker-pulse-red'
          : slope.status === 'Pemantauan'
          ? 'marker-pulse-yellow'
          : '';

      const iconHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110 ${isSelected ? 'scale-125 z-50' : 'z-20'}">
          ${
            isUrgent
              ? `<div class="absolute w-8 h-8 rounded-full ${pulseClass}" style="background-color: ${colors.ring};"></div>`
              : ''
          }
          <div class="w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[10px] font-bold text-white transition-all ${
            isSelected ? 'ring-4 ring-slate-900 shadow-xl' : ''
          }" style="background-color: ${colors.bg};">
            ${slope.status === 'Risiko Tinggi' ? '!' : '●'}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-slope-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      });

      const marker = L.marker(validCoords, { icon: customIcon });

      marker.on('click', () => {
        onSelectSlope(slope);
        map.flyTo(validCoords, Math.max(map.getZoom(), 13), { duration: 0.8 });
      });

      marker.addTo(map);
      markersRef.current[slope.id] = marker;
    });
  }, [filteredSlopes, selectedSlope, onSelectSlope]);

  // Handle "Lokasi Saya" button
  const handleLocateMe = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Default mock user GPS near Shah Alam Seksyen 7 for demo consistency or real GPS
    const defaultCoords: [number, number] = [3.0745, 101.5175];

    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos?.coords?.latitude);
          const lng = Number(pos?.coords?.longitude);
          if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
            updateUserPin([lat, lng]);
          } else {
            updateUserPin(defaultCoords);
          }
        },
        () => {
          // Fallback to Seksyen 7 Shah Alam (demo area)
          updateUserPin(defaultCoords);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );
    } else {
      updateUserPin(defaultCoords);
    }
  };

  const updateUserPin = (coords: [number, number]) => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const lat = Number(coords?.[0]);
    const lng = Number(coords?.[1]);
    const safeCoords: [number, number] =
      !isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)
        ? [lat, lng]
        : [3.0745, 101.5175];

    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.remove();
    }

    const userIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-blue-400/40 animate-ping"></div>
          <div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-[9px]">
            📍
          </div>
        </div>
      `,
      className: 'user-location-pin',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const userMarker = L.marker(safeCoords, { icon: userIcon }).addTo(map);
    userLocationMarkerRef.current = userMarker;
    setUserLocationActive(true);

    map.flyTo(safeCoords, 14, { duration: 1 });
  };

  // Center on a slope if selected from outside
  useEffect(() => {
    if (selectedSlope && mapInstanceRef.current) {
      const lat = Number(selectedSlope.coordinates?.[0]);
      const lng = Number(selectedSlope.coordinates?.[1]);
      if (!isNaN(lat) && !isNaN(lng) && isFinite(lat) && isFinite(lng)) {
        mapInstanceRef.current.flyTo([lat, lng], 14, { duration: 0.8 });
      }
    }
  }, [selectedSlope]);

  return (
    <div className="relative w-full h-[calc(100vh-6.5rem)] flex flex-col overflow-hidden bg-slate-100">
      {/* Search & Filter Floating Bar */}
      <div className="absolute top-4 left-4 right-4 md:left-6 md:right-auto md:w-[480px] z-30 space-y-2 pointer-events-auto">
        {/* Main Search Input */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/80 p-2 flex items-center gap-2">
          <Search className="w-5 h-5 text-slate-400 ml-2 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari lokasi atau ID cerun MPS (cth: MPS-SEL-0012, Selayang Heights)..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none py-1"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className={`md:hidden p-2 rounded-lg text-xs font-semibold flex items-center gap-1 ${
              showFiltersMobile ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Filters Dropdown / Pills */}
        <div
          className={`${
            showFiltersMobile ? 'flex' : 'hidden'
          } md:flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md p-2.5 rounded-xl shadow-md border border-slate-200 text-xs`}
        >
          {/* Daerah filter */}
          <div className="flex-1 min-w-[130px]">
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-0.5">
              Daerah
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* PBT filter */}
          <div className="flex-1 min-w-[130px]">
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-0.5">
              PBT
            </label>
            <select
              value={selectedPBT}
              onChange={(e) => setSelectedPBT(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 truncate"
            >
              {PBTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] uppercase font-semibold text-slate-400 mb-0.5">
              Status Cerun
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="Semua">Semua Status</option>
              <option value="Normal">Normal (Hijau)</option>
              <option value="Pemantauan">Pemantauan (Kuning)</option>
              <option value="Perhatian">Perhatian (Oren)</option>
              <option value="Risiko Tinggi">Risiko Tinggi (Merah)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons: "Lokasi Saya" & Quick reset */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={handleLocateMe}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shadow-lg backdrop-blur-md transition-all active:scale-95 ${
            userLocationActive
              ? 'bg-blue-600 text-white shadow-blue-500/20'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
          title="Kesan kedudukan GPS anda berhampiran cerun"
        >
          <Navigation className="w-4 h-4 text-blue-500 fill-blue-500" />
          <span className="hidden sm:inline">Lokasi Saya</span>
        </button>

        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo([3.255, 101.655], 12, { duration: 0.8 });
            }
          }}
          className="flex items-center justify-center p-2 rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-md text-xs font-semibold"
          title="Fokus Semula Kawasan MPS Selayang"
        >
          <Layers className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      {/* The Leaflet Map container */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-10" />

      {/* Bottom Map Legend Bar */}
      <div className="absolute bottom-6 left-4 z-20 pointer-events-auto bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200 p-3 max-w-sm hidden sm:block">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Petunjuk Status Cerun MPS ({counts.total})
          </span>
          <span className="text-[10px] text-slate-400">GIS Selayang</span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-emerald-200 shrink-0"></span>
            <span className="font-medium">Normal ({counts.normal})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-500 ring-2 ring-yellow-200 shrink-0"></span>
            <span className="font-medium">Pemantauan ({counts.pemantauan})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 ring-2 ring-orange-200 shrink-0"></span>
            <span className="font-medium">Perhatian ({counts.perhatian})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-200 animate-pulse shrink-0"></span>
            <span className="font-medium">Risiko Tinggi ({counts.risikoTinggi})</span>
          </div>
        </div>
      </div>

      {/* Selected Slope Information Card (as specified in prompt Section 2) */}
      {selectedSlope && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-30 pointer-events-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all duration-300">
            {/* Header banner */}
            <div className="bg-slate-900 text-white px-4 py-3 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs tracking-wider text-amber-400 font-bold">
                    CERUN {selectedSlope.id}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      selectedSlope.status === 'Normal'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : selectedSlope.status === 'Pemantauan'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                        : selectedSlope.status === 'Perhatian'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                        : 'bg-red-500/20 text-red-300 border border-red-500/40'
                    }`}
                  >
                    {selectedSlope.status}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 mt-1">
                  {selectedSlope.location}
                </h3>
                <p className="text-[11px] text-slate-400">
                  {selectedSlope.pbt} · Selangor
                </p>
              </div>
              <button
                onClick={() => onSelectSlope(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs py-1 border-b border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Tahap Risiko
                  </span>
                  <span
                    className={`font-bold ${
                      selectedSlope.riskLevel === 'Kritikal' || selectedSlope.riskLevel === 'Tinggi'
                        ? 'text-red-600'
                        : selectedSlope.riskLevel === 'Sederhana'
                        ? 'text-yellow-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {selectedSlope.riskLevel}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                    Pemeriksaan Terakhir
                  </span>
                  <span className="text-slate-700 font-semibold">
                    {selectedSlope.lastInspection}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Jenis: <strong className="text-slate-800 font-medium">{selectedSlope.slopeType}</strong></span>
                <span>Tinggi: <strong className="text-slate-800 font-medium">{selectedSlope.height}m</strong></span>
                <span>Kecerunan: <strong className="text-slate-800 font-medium">{selectedSlope.gis ? `Kelas ${selectedSlope.gis.kelasKecerunan}` : `${selectedSlope.gradient}°`}</strong></span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => onViewSlopeDetail(selectedSlope)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Lihat Maklumat Cerun</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onReportSlope(selectedSlope)}
                    className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Lapor Masalah</span>
                  </button>

                  <button
                    onClick={() => onViewQRSignboard(selectedSlope)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5 text-slate-600" />
                    <span>Papan Tanda QR</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
