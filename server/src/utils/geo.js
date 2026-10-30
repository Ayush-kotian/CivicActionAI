/**
 * Calculate distance in meters between two lat/lon coordinates using Haversine formula
 */
export function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return Infinity;
  }
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

/**
 * Returns a proximity similarity score between 0.0 and 1.0 based on distance
 * <= 100m -> 1.0
 * <= 300m -> 0.85
 * <= 600m -> 0.70
 * <= 1000m -> 0.45
 * <= 2000m -> 0.20
 * > 2000m -> 0.0
 */
export function calculateProximityScore(distanceMeters) {
  if (distanceMeters <= 100) return 1.0;
  if (distanceMeters <= 300) return 0.85;
  if (distanceMeters <= 600) return 0.70;
  if (distanceMeters <= 1000) return 0.45;
  if (distanceMeters <= 2000) return 0.20;
  return 0.0;
}
