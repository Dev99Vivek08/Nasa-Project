export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatNumber(n: number, decimals = 2): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: decimals,
  }).format(n);
}

export function kmToMiles(km: number): number {
  return km * 0.621371;
}

export function getHazardLevel(asteroid: any): "safe" | "watch" | "hazard" {
  if (asteroid.is_potentially_hazardous_asteroid) return "hazard";
  return "safe";
}
