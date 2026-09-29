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

export const isSevere = (value: string) => /SANGAT TINGGI|Kritikal/i.test(value);
