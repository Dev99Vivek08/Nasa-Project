// NOAA Space Weather APIs — all public, no key required, all CORS-enabled

export interface SolarWindPlasma {
  time_tag: string;
  density: number;
  speed: number;
  temperature: number;
}

export interface KpReading {
  time_tag: string;
  kp_index: number;
  estimated_kp: number;
}

export interface XrayReading {
  time_tag: string;
  flux: number;
  energy: string;
}

export interface NOAAAlert {
  product_id: string;
  issue_datetime: string;
  message: string;
}

// Solar wind plasma — 7-day history, 1-min resolution
// Returns array of arrays: [time, density, speed, temperature, ...]
export async function fetchSolarWind(): Promise<SolarWindPlasma[]> {
  const res = await fetch("https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json");
  if (!res.ok) throw new Error("Failed to fetch solar wind data");
  const raw: string[][] = await res.json();
  return raw.slice(1).map(row => ({
    time_tag: row[0],
    density: parseFloat(row[1]),
    speed: parseFloat(row[2]),
    temperature: parseFloat(row[3]),
  })).filter(d => !isNaN(d.speed) && d.speed > 0);
}

// Planetary Kp index — 1-minute estimates, ~24h history
export async function fetchKpIndex(): Promise<KpReading[]> {
  const res = await fetch("https://services.swpc.noaa.gov/json/planetary_k_index_1m.json");
  if (!res.ok) throw new Error("Failed to fetch Kp index");
  const raw: KpReading[] = await res.json();
  return raw.filter(d => d.estimated_kp !== null && !isNaN(d.estimated_kp));
}

// X-ray flux from GOES satellite — 6-hour window, both energy bands
export async function fetchXrayFlux(): Promise<XrayReading[]> {
  const res = await fetch("https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json");
  if (!res.ok) throw new Error("Failed to fetch X-ray flux");
  const raw: XrayReading[] = await res.json();
  // Use the 0.1-0.8nm band (the one used for flare classification)
  return raw.filter(d => d.energy === "0.1-0.8nm");
}

// NOAA alerts feed — geomagnetic storms, radio blackouts, radiation belts
export async function fetchNOAAAlerts(): Promise<NOAAAlert[]> {
  const res = await fetch("https://services.swpc.noaa.gov/products/alerts.json");
  if (!res.ok) throw new Error("Failed to fetch NOAA alerts");
  const raw: NOAAAlert[] = await res.json();
  return raw.slice(0, 10);
}

// Kp value → NOAA storm category + display color
export function kpToStormCategory(kp: number): { label: string; color: string } {
  if (kp < 4) return { label: "Quiet", color: "#00D4FF" };
  if (kp < 5) return { label: "Unsettled", color: "#6D5DFC" };
  if (kp < 6) return { label: "G1 Minor", color: "#a0ff00" };
  if (kp < 7) return { label: "G2 Moderate", color: "#ffc107" };
  if (kp < 8) return { label: "G3 Strong", color: "#ff7043" };
  if (kp < 9) return { label: "G4 Severe", color: "#FF4D9D" };
  return { label: "G5 Extreme", color: "#ff0000" };
}

// Convert X-ray flux to flare class (same thresholds NASA uses)
export function fluxToFlareClass(flux: number): { cls: string; color: string } {
  if (flux < 1e-7) return { cls: "A", color: "#00D4FF" };
  if (flux < 1e-6) return { cls: "B", color: "#6D5DFC" };
  if (flux < 1e-5) return { cls: "C", color: "#a0ff00" };
  if (flux < 1e-4) return { cls: "M", color: "#ffc107" };
  return { cls: "X", color: "#FF4D9D" };
}

// Alert message → color by severity keyword
export function alertColor(msg: string): string {
  if (msg.includes("ALERT")) return "#FF4D9D";
  if (msg.includes("WARNING")) return "#ffc107";
  if (msg.includes("WATCH")) return "#6D5DFC";
  return "#00D4FF";
}

// Pull a readable title from raw NOAA alert text
export function parseAlertTitle(msg: string): string {
  const lines = msg.split("\n").filter(l => l.trim());
  for (const line of lines) {
    const l = line.trim();
    if (l.startsWith("ALERT:") || l.startsWith("WARNING:") || l.startsWith("WATCH:") || l.startsWith("SUMMARY:") || l.startsWith("Space Weather Message Code:")) {
      return l;
    }
  }
  return lines[0]?.trim() ?? "Space Weather Notice";
}
