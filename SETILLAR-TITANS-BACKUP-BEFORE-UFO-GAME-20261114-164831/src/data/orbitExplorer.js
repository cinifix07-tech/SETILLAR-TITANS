export const orbitExplorerProfiles = {
  leo: { id: 'leo', name: 'Low Earth Orbit', abbr: 'LEO', altitudeKm: 400, inclination: 51.6, angularRate: 0.58, applications: 'Earth observation, imaging, and scientific research.', advantages: 'Close passes can support detailed observations and shorter communication paths.', limitations: 'The spacecraft moves quickly over the surface; a location is visible only during a pass.', fit: 'A useful example for Earth observation and low-altitude science.' },
  sso: { id: 'sso', name: 'Sun-Synchronous Orbit', abbr: 'SSO', altitudeKm: 600, inclination: 97.8, angularRate: 0.52, applications: 'Earth imaging, environmental monitoring, and remote sensing.', advantages: 'A suitable sun-synchronous orbit can provide a similar local solar time for repeat observations.', limitations: 'SSO is generally a special near-polar LEO, not a separate altitude category. Not every polar orbit is sun-synchronous.', fit: 'A strong example for repeated Earth-surface observations under similar lighting.' },
  meo: { id: 'meo', name: 'Medium Earth Orbit', abbr: 'MEO', altitudeKm: 10000, inclination: 55, angularRate: 0.27, applications: 'Navigation and positioning constellations, including GPS-like systems.', advantages: 'Greater coverage per spacecraft than low Earth orbit.', limitations: 'Less surface detail than a closer orbit; global coverage generally needs a constellation.', fit: 'A useful navigation-orbit example rather than a fine-detail imaging orbit.' },
  geo: { id: 'geo', name: 'Geostationary Earth Orbit', abbr: 'GEO', altitudeKm: 35786, inclination: 0, angularRate: 0.12, applications: 'Communication, weather monitoring, broadcasting, and data relay.', advantages: 'Can continuously view a broad region from a fixed longitude.', limitations: 'The long distance makes fine surface detail harder; polar regions are poorly covered.', fit: 'A useful example for continuous regional monitoring and communications.' },
}

const EARTH_RADIUS_KM = 6371
const EARTH_MU_KM3_S2 = 398600.4418
export function getIllustrativeOrbitPeriod(profile) {
  const semiMajorAxisKm = EARTH_RADIUS_KM + profile.altitudeKm
  const seconds = 2 * Math.PI * Math.sqrt(semiMajorAxisKm ** 3 / EARTH_MU_KM3_S2)
  const minutes = seconds / 60
  return minutes >= 60 ? `${(minutes / 60).toFixed(1)} hours` : `${Math.round(minutes)} minutes`
}

// Log-compressed radius keeps all four trajectories visible in the same scene.
export function getIllustrativeSceneRadius(profile) {
  return 1.16 + Math.log1p(profile.altitudeKm / 400) * 0.9
}
