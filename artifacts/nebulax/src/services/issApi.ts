export interface ISSPosition {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface Astronaut {
  name: string;
  craft: string;
}

const PROXY = "https://api.allorigins.win/get?url=";

export async function fetchISSPosition(): Promise<ISSPosition> {
  const url = encodeURIComponent("http://api.open-notify.org/iss-now.json");
  const res = await fetch(`${PROXY}${url}`);
  if (!res.ok) throw new Error("Failed to fetch ISS position");
  const json = await res.json();
  const data = JSON.parse(json.contents);
  return {
    latitude: parseFloat(data.iss_position.latitude),
    longitude: parseFloat(data.iss_position.longitude),
    timestamp: data.timestamp,
  };
}

export async function fetchAstronauts(): Promise<Astronaut[]> {
  const url = encodeURIComponent("http://api.open-notify.org/astros.json");
  const res = await fetch(`${PROXY}${url}`);
  if (!res.ok) throw new Error("Failed to fetch astronauts");
  const json = await res.json();
  const data = JSON.parse(json.contents);
  return data.people;
}
