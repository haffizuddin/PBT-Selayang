import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Slope, SlopeStatus, RiskLevel } from '../types/slope';
import { DISTRICTS, PBTS } from '../data/mockSlopes';
import { X, MapPin, Save, Plus, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AdminAddSlopeModalProps {
  onClose: () => void;
  onSaveSlope: (newSlope: Slope) => void;
}

export const AdminAddSlopeModal: React.FC<AdminAddSlopeModalProps> = ({
  onClose,
  onSaveSlope
}) => {
  // Form State
  const [id, setId] = useState(`SGR-SEL-${Math.floor(1000 + Math.random() * 9000)}`);
  const [name, setName] = useState('Cerun Taman Bukit Indah');
  const [location, setLocation] = useState('Seksyen 13, Shah Alam');
  const [district, setDistrict] = useState('Petaling');
  const [pbt, setPbt] = useState('Majlis Bandaraya Shah Alam (MBSA)');
  const [lat, setLat] = useState(3.0850);
  const [lng, setLng] = useState(101.5350);
  const [slopeType, setSlopeType] = useState<Slope['slopeType']>('Cerun Potongan');
  const [height, setHeight] = useState(14);
  const [gradient, setGradient] = useState(35);
  const [status, setStatus] = useState<SlopeStatus>('Pemantauan');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('Sederhana');
  const [lastInspection, setLastInspection] = useState('20 September 2026');
  const [nextInspection, setNextInspection] = useState('20 Mac 2027');

  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Initialize interactive pin selection on map
  useEffect(() => {
    if (!miniMapContainerRef.current) return;
    if (miniMapInstanceRef.current) return;

    const safeLat = !isNaN(lat) && isFinite(lat) ? lat : 3.0850;
    const safeLng = !isNaN(lng) && isFinite(lng) ? lng : 101.5350;

    const map = L.map(miniMapContainerRef.current, {
      center: [safeLat, safeLng],
      zoom: 12,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    const marker = L.marker([safeLat, safeLng], { draggable: true }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', () => {
      const position = marker.getLatLng();
      if (position && !isNaN(position.lat) && !isNaN(position.lng)) {
        setLat(Number(position.lat.toFixed(5)));
        setLng(Number(position.lng.toFixed(5)));
      }
    });

    map.on('click', (e) => {
      if (e?.latlng && !isNaN(e.latlng.lat) && !isNaN(e.latlng.lng)) {
        marker.setLatLng(e.latlng);
        setLat(Number(e.latlng.lat.toFixed(5)));
        setLng(Number(e.latlng.lng.toFixed(5)));
      }
    });

    miniMapInstanceRef.current = map;

    return () => {
      map.remove();
      miniMapInstanceRef.current = null;
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalLat = !isNaN(lat) && isFinite(lat) ? lat : 3.0850;
    const finalLng = !isNaN(lng) && isFinite(lng) ? lng : 101.5350;

    const createdSlope: Slope = {
      id: id.trim().toUpperCase(),
      name: name.trim(),
      location: location.trim(),
      district,
      pbt,
      coordinates: [finalLat, finalLng],
      slopeType,
      height: Number(height) || 12,
      gradient: Number(gradient) || 35,
      status,
      riskLevel,
      lastInspection,
      nextInspection,
      registeredDate: '28 September 2026',
      condition: {
        stability: status === 'Risiko Tinggi' ? 'Perlu Pembaikan' : 'Stabil',
        drainage: 'Baik',
        surfaceErosion: 'Rendah',
        cracks: 'Tiada dikesan',
        vegetation: 'Sederhana',
        groundMovement: 'Tiada dikesan',
        structureType: 'Dinding Penahan Konkrit & Parit Bertingkat',
        notes: 'Pendaftaran cerun baharu ke dalam sistem SIAC PBT Selangor.'
      }
    };

    onSaveSlope(createdSlope);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-amber-400" />
              <span>Daftar Cerun Baharu (Cawangan Cerun PBT)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Pendaftaran titik cerun ke dalam inventori GIS Selangor & penjanaan automatik QR kekal
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
          {/* Section 1: Pengenalan & Lokasi */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-1">
              1. Pengenalan & Pentadbiran Cerun
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ID Cerun (Unik) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900 uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nama / Penerangan Tapak <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lokasi / Seksyen / Jalan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Daerah</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-medium"
                >
                  {DISTRICTS.filter((d) => d !== 'Semua Daerah').map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">PBT Bertanggungjawab</label>
                <select
                  value={pbt}
                  onChange={(e) => setPbt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-medium"
                >
                  {PBTS.filter((p) => p !== 'Semua PBT').map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Koordinat & Peta Interaktif (Prompt Section 12) */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-1">
              2. Koordinat GPS & Pemilihan Lokasi di Peta
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={isNaN(lat) ? '' : lat}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value);
                    if (!isNaN(parsed) && isFinite(parsed)) {
                      setLat(parsed);
                      if (markerRef.current && !isNaN(lng) && isFinite(lng)) {
                        markerRef.current.setLatLng([parsed, lng]);
                        miniMapInstanceRef.current?.panTo([parsed, lng]);
                      }
                    } else {
                      setLat(NaN);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={isNaN(lng) ? '' : lng}
                  onChange={(e) => {
                    const parsed = parseFloat(e.target.value);
                    if (!isNaN(parsed) && isFinite(parsed)) {
                      setLng(parsed);
                      if (markerRef.current && !isNaN(lat) && isFinite(lat)) {
                        markerRef.current.setLatLng([lat, parsed]);
                        miniMapInstanceRef.current?.panTo([lat, parsed]);
                      }
                    } else {
                      setLng(NaN);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                />
              </div>
            </div>

            {/* Click directly on map */}
            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <div className="bg-slate-100 px-3 py-1.5 text-[11px] text-slate-600 flex items-center justify-between">
                <span>Klik pada peta atau seret pin untuk menetapkan titik lokasi cerun</span>
                <span className="font-mono text-slate-800 font-bold">{lat}, {lng}</span>
              </div>
              <div ref={miniMapContainerRef} className="h-44 w-full bg-slate-200" />
            </div>
          </div>

          {/* Section 3: Ciri Geoteknikal & Status */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-1">
              3. Spesifikasi Geoteknikal & Status Risiko
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jenis Cerun</label>
                <select
                  value={slopeType}
                  onChange={(e) => setSlopeType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                >
                  <option value="Cerun Potongan">Cerun Potongan</option>
                  <option value="Cerun Tambakan">Cerun Tambakan</option>
                  <option value="Cerun Semulajadi">Cerun Semulajadi</option>
                  <option value="Cerun Berstruktur Gabion">Cerun Berstruktur Gabion</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ketinggian (meter)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Kecerunan (° darjah)</label>
                <input
                  type="number"
                  value={gradient}
                  onChange={(e) => setGradient(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Status Cerun</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SlopeStatus)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-semibold"
                >
                  <option value="Normal">Normal</option>
                  <option value="Pemantauan">Pemantauan</option>
                  <option value="Perhatian">Perhatian</option>
                  <option value="Risiko Tinggi">Risiko Tinggi</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tahap Risiko</label>
                <select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 font-semibold"
                >
                  <option value="Rendah">Rendah</option>
                  <option value="Sederhana">Sederhana</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Kritikal">Kritikal</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tarikh Pemeriksaan Terakhir</label>
                <input
                  type="text"
                  value={lastInspection}
                  onChange={(e) => setLastInspection(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tarikh Pemeriksaan Seterusnya</label>
                <input
                  type="text"
                  value={nextInspection}
                  onChange={(e) => setNextInspection(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-slate-500 text-[11px]">
              * PBT Selangor akan menjana kod QR & plat tanda secara serta-merta.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Daftar & Jana QR Cerun</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
