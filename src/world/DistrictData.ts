import { DistrictInfo, DistrictId } from '../types';

export const DISTRICTS: Record<DistrictId, DistrictInfo> = {
  downtown: {
    id: 'downtown',
    name: 'Downtown Commercial Hub',
    subtitle: 'Sector 1 • High-density towers & corporate offices',
    bounds: { minX: 80, maxX: 380, minZ: 80, maxZ: 380 },
    ambientColor: 0x38bdf8,
    fogDensity: 0.007,
    fogColor: 0x0a1020
  },
  residential: {
    id: 'residential',
    name: 'Westside Residential',
    subtitle: 'Sector 2 • Brownstone blocks & Safehouse Apartment',
    bounds: { minX: -240, maxX: 80, minZ: 80, maxZ: 380 },
    ambientColor: 0xf59e0b,
    fogDensity: 0.009,
    fogColor: 0x11131a
  },
  industrial: {
    id: 'industrial',
    name: 'Southport Industrial Yard',
    subtitle: 'Sector 3 • Abandoned ChronoTech Office & Freight Canal',
    bounds: { minX: 80, maxX: 380, minZ: -240, maxZ: 80 },
    ambientColor: 0x10b981,
    fogDensity: 0.012,
    fogColor: 0x081512
  },
  forest: {
    id: 'forest',
    name: 'Northwood Forest Outskirts',
    subtitle: 'Sector 4 • Pine ridge, Relay Tower & Marcus\'s Cabin',
    bounds: { minX: -360, maxX: 80, minZ: -360, maxZ: 80 },
    ambientColor: 0x6366f1,
    fogDensity: 0.015,
    fogColor: 0x070b14
  },
  underground: {
    id: 'underground',
    name: 'Subterranean Facility "Site-Zero"',
    subtitle: 'Restricted Level -35 • Chrono-Resonance Laboratory',
    bounds: { minX: 450, maxX: 750, minZ: 450, maxZ: 750 },
    ambientColor: 0x06b6d4,
    fogDensity: 0.022,
    fogColor: 0x020812
  }
};

export function getDistrictAt(x: number, z: number, y: number): DistrictInfo {
  if (y < -15) {
    return DISTRICTS.underground;
  }
  if (x >= 80 && z >= 80) return DISTRICTS.downtown;
  if (x < 80 && z >= 80) return DISTRICTS.residential;
  if (x >= 80 && z < 80) return DISTRICTS.industrial;
  return DISTRICTS.forest;
}
