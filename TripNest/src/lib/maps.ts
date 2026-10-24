/** Google Maps link + embed helpers derived from stored coordinates. */

export function mapsSearchUrl(lat: number, lng: number, label?: string): string {
  const q = label
    ? `${encodeURIComponent(label)}@${lat},${lng}`
    : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function mapsEmbedUrl(lat: number, lng: number, zoom = 10): string {
  return `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
}

export function mapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}
