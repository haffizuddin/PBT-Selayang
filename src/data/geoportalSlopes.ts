import raw from './geoportal-cerun.txt?raw';
import { GeoportalRecord, RiskLevel, Slope, SlopeStatus } from '../types/slope';

// Approximate centre per planning sub-block, used when a record has no KOORDINAT
const BPK_CENTRES: Record<string, [number, number]> = {
  'BPK 4.3': [3.3050, 101.6800],
};
const DEFAULT_CENTRE: [number, number] = [3.2600, 101.6500];

const FIELD_MAP: Record<string, keyof GeoportalRecord> = {
  'ZON AHLI MAJLIS': 'zonAhliMajlis',
  'AGENSI MENYELENGGARA': 'agensi',
  'BLOK PERANCANGAN': 'blokPerancangan',
  'BLOK PERANCANGAN KECIL': 'blokPerancanganKecil',
  'TAHAP BAHAYA': 'tahapBahaya',
  'ID CERUN': 'idCerun',
  'ID JMG': 'idJmg',
  'NAMA_JLN': 'namaJalan',
  'TAHAP RISIKO': 'tahapRisiko',
  'KELAS KECERUNAN': 'kelasKecerunan',
  'TINGGI (m)': 'tinggi',
};

type ParsedRecord = { record: GeoportalRecord; coords: [number, number] | undefined };

export function parseGeoportalText(text: string): ParsedRecord[] {
  return text
    .split(/\n\s*\n/)
    .map((block) => {
      const record: Partial<GeoportalRecord> = {};
      let coords: [number, number] | undefined;
      for (const line of block.split('\n')) {
        if (!line.trim() || line.trim().startsWith('#')) continue;
        const m = line.trim().match(/^(.+?)(?:\t+|\s{2,})(.+)$/);
        if (!m) continue;
        const label = m[1].trim().toUpperCase().replace('(M)', '(m)');
        const value = m[2].trim();
        if (label === 'KOORDINAT') {
          const [lat, lng] = value.split(',').map((v) => parseFloat(v));
          if (!isNaN(lat) && !isNaN(lng)) coords = [lat, lng];
        } else if (FIELD_MAP[label]) {
          record[FIELD_MAP[label]] = value;
        }
      }
      return record.idCerun ? { record: record as GeoportalRecord, coords } : null;
    })
    .filter((r): r is ParsedRecord => r !== null);
}

// "T240/S8" → "T240-S8": slashes can't sit in the /cerun/<id> QR URL
export const slugifySlopeId = (id: string) => id.trim().replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');

const toRisk = (tahap: string): RiskLevel => {
  const t = tahap.toUpperCase();
  if (t.includes('SANGAT')) return 'Kritikal';
  if (t.includes('TINGGI')) return 'Tinggi';
  if (t.includes('SEDERHANA')) return 'Sederhana';
  return 'Rendah';
};
const toStatus = (risk: RiskLevel): SlopeStatus =>
  risk === 'Kritikal' ? 'Risiko Tinggi' : risk === 'Tinggi' ? 'Perhatian' : risk === 'Sederhana' ? 'Pemantauan' : 'Normal';

const titleCase = (s: string) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

export function geoportalToSlope({ record, coords }: ParsedRecord, index: number): Slope {
  const risk = toRisk(record.tahapRisiko || record.tahapBahaya || '');
  const bpkCode = (record.blokPerancanganKecil || '').split(':')[0].trim();
  const bpkName = titleCase((record.blokPerancanganKecil || '').split(':')[1]?.trim() || '');
  const road = titleCase(record.namaJalan || '');
  // Records without KOORDINAT share a BPK centre; fan them out so markers don't stack
  const base = BPK_CENTRES[bpkCode] || DEFAULT_CENTRE;
  const approx: [number, number] = [base[0] + (index % 5) * 0.004, base[1] + Math.floor(index / 5) * 0.004];
  const critical = risk === 'Kritikal' || risk === 'Tinggi';

  return {
    id: slugifySlopeId(record.idCerun),
    name: `Cerun ${record.idCerun} (${road})`,
    location: [road, bpkName].filter(Boolean).join(', '),
    district: 'Gombak',
    pbt: 'Majlis Perbandaran Selayang (MPS)',
    coordinates: coords || approx,
    coordinatesApprox: !coords,
    slopeType: 'Cerun Potongan',
    height: parseFloat(record.tinggi) || 0,
    gradient: 0,
    status: toStatus(risk),
    riskLevel: risk,
    lastInspection: '-',
    nextInspection: '-',
    registeredDate: '-',
    condition: {
      stability: critical ? 'Perlu Pembaikan' : 'Stabil',
      drainage: 'Baik',
      surfaceErosion: 'Tiada',
      cracks: 'Tiada dikesan',
      vegetation: 'Sederhana',
      groundMovement: 'Tiada dikesan',
      structureType: `Diselenggara oleh ${record.agensi || '-'}`,
      notes: `Rekod daripada Geoportal MPS. Tahap bahaya: ${record.tahapBahaya || '-'}; tahap risiko: ${record.tahapRisiko || '-'}; kelas kecerunan ${record.kelasKecerunan || '-'}.`,
    },
    gis: record,
  };
}

export const GEOPORTAL_SLOPES: Slope[] = parseGeoportalText(raw).map(geoportalToSlope);
