export interface Coordinate {
  latitude: number
  longitude: number
  timestamp?: number
}

/**
 * Calculates the distance between two coordinates in kilometers using the Haversine formula.
 */
export function getDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = deg2rad(coord2.latitude - coord1.latitude)
  const dLon = deg2rad(coord2.longitude - coord1.longitude)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(coord1.latitude)) *
      Math.cos(deg2rad(coord2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

/**
 * Calculates the total cumulative distance of a path (array of coordinates) in kilometers.
 */
export function getPathDistance(path: Coordinate[]): number {
  let totalDistance = 0
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += getDistance(path[i], path[i + 1])
  }
  return totalDistance
}
