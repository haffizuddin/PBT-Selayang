import { Slope } from '../types/slope';

// The handful of facts a member of the public needs, shared by the map popup and slope page
export function slopeKeyFacts(slope: Slope): [string, string][] {
  if (slope.gis) {
    const g = slope.gis;
    return [
      ['Tahap risiko', g.tahapRisiko],
      ['Tahap bahaya', g.tahapBahaya],
      ['Tinggi', `${g.tinggi} m`],
      ['Kelas kecerunan', g.kelasKecerunan],
      ['Diselenggara oleh', g.agensi],
      ['Kawasan', g.blokPerancanganKecil.split(':')[1]?.trim() || g.blokPerancanganKecil],
    ];
  }
  return [
    ['Tahap risiko', slope.riskLevel],
    ['Tinggi', `${slope.height} m`],
    ['Kecerunan', `${slope.gradient}°`],
    ['Jenis', slope.slopeType],
    ['Pemeriksaan terakhir', slope.lastInspection],
    ['Pemeriksaan seterusnya', slope.nextInspection],
  ];
}

// Everything else on record: the geoportal fields, or the inspection condition for demo slopes
export function slopeFullDetails(slope: Slope): [string, string][] {
  if (slope.gis) {
    const g = slope.gis;
    return [
      ['ID JMG', g.idJmg],
      ['Nama jalan', g.namaJalan],
      ['Zon ahli majlis', g.zonAhliMajlis],
      ['Blok perancangan', g.blokPerancangan],
      ['Blok perancangan kecil', g.blokPerancanganKecil],
    ];
  }
  const c = slope.condition;
  return [
    ['Kestabilan', c.stability],
    ['Saliran', c.drainage],
    ['Hakisan permukaan', c.surfaceErosion],
    ['Retakan', c.cracks],
    ['Tumbuhan', c.vegetation],
    ['Pergerakan tanah', c.groundMovement],
    ['Struktur', c.structureType],
    ['Catatan', c.notes],
  ];
}

export const isSevere = (value: string) => /SANGAT TINGGI|Kritikal/i.test(value);
