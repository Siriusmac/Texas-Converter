// Mean Earth radius; great-circle distance on a sphere, not a road route.
export const EARTH_RADIUS_KM = 6371.0088;
export function validCoordinate(point) {
  return point && Number.isFinite(point.latitude) && Number.isFinite(point.longitude)
    && Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180;
}
export function greatCircleDistance(a, b) {
  if (!validCoordinate(a) || !validCoordinate(b)) throw new RangeError('Invalid coordinates');
  const radians = degrees => degrees * Math.PI / 180;
  const haversine = Math.sin(radians(b.latitude - a.latitude) / 2) ** 2
    + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude))
    * Math.sin(radians(b.longitude - a.longitude) / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(Math.min(1, Math.max(0, haversine))));
}

export function extractCoordinates(entity) {
  const claims = (entity.claims?.P625 || []).filter(c => c.rank !== 'deprecated');
  const preferred = claims.some(c => c.rank === 'preferred');
  const points = claims.filter(c => (!preferred || c.rank === 'preferred')
    && !Object.keys(c.qualifiers || {}).length && c.mainsnak?.snaktype === 'value')
    .map(c => c.mainsnak.datavalue?.value)
    .filter(p => validCoordinate(p) && /^https?:\/\/www\.wikidata\.org\/entity\/Q2$/.test(p.globe));
  const unique = [...new Map(points.map(p => [`${p.latitude}:${p.longitude}`, p])).values()];
  // Conflicting coordinates require source review; never pick one arbitrarily.
  return unique.length === 1 ? {latitude: unique[0].latitude, longitude: unique[0].longitude} : null;
}
