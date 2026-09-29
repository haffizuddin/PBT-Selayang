export type SlopeStatus = 'Normal' | 'Pemantauan' | 'Perhatian' | 'Risiko Tinggi';
export type RiskLevel = 'Rendah' | 'Sederhana' | 'Tinggi' | 'Kritikal';

export interface SlopeCondition {
  stability: 'Stabil' | 'Perlu Pembaikan' | 'Kritikal';
  drainage: 'Baik' | 'Tersumbat Sebahagian' | 'Rosak';
  surfaceErosion: 'Tiada' | 'Rendah' | 'Sederhana' | 'Ketara';
  cracks: 'Tiada dikesan' | 'Retakan Halus' | 'Retakan Lebar';
  vegetation: 'Baik / Teratur' | 'Sederhana' | 'Tebal / Melitupi Longkang';
  groundMovement: 'Tiada dikesan' | 'Kesan Rayapan' | 'Dikesan';
  structureType: string;
  notes: string;
}

// Attributes as shown in the Geoportal MPS popup
export interface GeoportalRecord {
  zonAhliMajlis: string;
  agensi: string;
  blokPerancangan: string;
  blokPerancanganKecil: string;
  tahapBahaya: string;
  idCerun: string;
  idJmg: string;
  namaJalan: string;
  tahapRisiko: string;
  kelasKecerunan: string;
  tinggi: string;
}

export interface Slope {
  id: string; // e.g. "SGR-SHA-0012"
  name: string;
  location: string;
  district: string; // e.g. "Petaling"
  pbt: string; // e.g. "Majlis Bandaraya Shah Alam (MBSA)"
  coordinates: [number, number]; // [lat, lng]
  slopeType: 'Cerun Potongan' | 'Cerun Tambakan' | 'Cerun Semulajadi' | 'Cerun Berstruktur Gabion';
  height: number; // in meters
  gradient: number; // in degrees
  status: SlopeStatus;
  riskLevel: RiskLevel;
  lastInspection: string;
  nextInspection: string;
  condition: SlopeCondition;
  imageUrl?: string;
  registeredDate: string;
  coordinatesApprox?: boolean; // true when the source record had no coordinates
  gis?: GeoportalRecord; // present for slopes imported from Geoportal MPS
}

export type ReportCategory =
  | 'Retakan tanah'
  | 'Tanah runtuh'
  | 'Pergerakan tanah'
  | 'Batu jatuh'
  | 'Longkang tersumbat'
  | 'Air keluar dari cerun'
  | 'Hakisan'
  | 'Pokok tumbang'
  | 'Struktur penahan rosak'
  | 'Lain-lain';

export type ReportStatus = 'Diterima' | 'Dalam Semakan' | 'Pemeriksaan Tapak' | 'Tindakan' | 'Selesai';

export interface ReportTimelineStep {
  title: string;
  date: string;
  completed: boolean;
  current?: boolean;
  note?: string;
}

export interface SlopeReport {
  id: string; // e.g. "RPT-2026-00821"
  slopeId: string;
  slopeLocation: string;
  district: string;
  pbt: string;
  category: ReportCategory;
  description: string;
  photoUrls: string[];
  reporterName?: string;
  reporterPhone?: string;
  reporterEmail?: string;
  reporterCoords?: [number, number];
  dateReported: string;
  timestamp: number;
  status: ReportStatus;
  officerRemarks?: string;
  timeline: ReportTimelineStep[];
}

export type ViewMode =
  | 'map'
  | 'slope-detail'
  | 'report-issue'
  | 'report-success'
  | 'track-report'
  | 'admin-dashboard'
  | 'admin-slopes'
  | 'qr-gallery';
