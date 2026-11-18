// Coordonnees approximatives (centre-ville) des villes des offres.
// Les offres n'ont qu'une ville en base : une ville absente d'ici n'apparait pas sur la carte.
const CITY_COORDS: Record<string, [number, number]> = {
  paris: [48.8566, 2.3522],
  arcachon: [44.6586, -1.1689],
  beaune: [47.026, 4.84],
  brighton: [50.8225, -0.1372],
  chamonix: [45.9237, 6.8694],
  chessy: [48.8715, 2.7714],
  fontainebleau: [48.4047, 2.7016],
  hendaye: [43.3586, -1.7744],
  'la baule': [47.2867, -2.39],
  'les deux alpes': [45.0081, 6.1214],
  marrakech: [31.6295, -7.9811],
  poitiers: [46.5802, 0.3404],
  rome: [41.9028, 12.4964],
  'saint aignan': [47.2689, 1.3756],
  vichy: [46.1278, 3.4258],
  // grandes villes, pour les futures offres
  lyon: [45.764, 4.8357],
  marseille: [43.2965, 5.3698],
  bordeaux: [44.8378, -0.5792],
  lille: [50.6292, 3.0573],
  toulouse: [43.6047, 1.4442],
  nantes: [47.2184, -1.5536],
  nice: [43.7102, 7.262],
  strasbourg: [48.5734, 7.7521],
  montpellier: [43.6108, 3.8767],
  rennes: [48.1173, -1.6778],
}

const key = (city: string) =>
  city.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[-']/g, ' ').replace(/\s+/g, ' ').trim()

export function cityCoords(city: string | null | undefined): [number, number] | null {
  if (!city) return null
  return CITY_COORDS[key(city)] ?? null
}

/** Distance a vol d'oiseau en km (formule de haversine) */
export function distanceKm(a: [number, number], b: [number, number]): number {
  const R = 6371
  const dLat = ((b[0] - a[0]) * Math.PI) / 180
  const dLng = ((b[1] - a[1]) * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}
