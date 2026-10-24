// Waits for the Google Maps script (added by the app's loadGoogleMaps()) and loads
// the libraries the map view needs. Safe to call multiple times.

const POLL_MS = 100;

type MapsNamespace = { maps?: { importLibrary?: (name: string) => Promise<unknown> } };

let pending: Promise<void> | null = null;

export function loadGoogleMapsLibraries(timeoutMs = 15_000): Promise<void> {
  pending ??= (async () => {
    const started = Date.now();
    while (!(globalThis as { google?: MapsNamespace }).google?.maps?.importLibrary) {
      if (Date.now() - started > timeoutMs) throw new Error('Google Maps script did not load');
      await new Promise(resolve => setTimeout(resolve, POLL_MS));
    }
    await Promise.all([google.maps.importLibrary('maps'), google.maps.importLibrary('marker')]);
  })().catch(error => {
    pending = null; // allow a retry later
    throw error;
  });
  return pending;
}
