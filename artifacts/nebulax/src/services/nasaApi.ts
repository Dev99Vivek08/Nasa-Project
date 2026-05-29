export interface APODData {
  date: string;
  explanation: string;
  hdurl: string;
  media_type: string;
  service_version: string;
  title: string;
  url: string;
}

export interface AsteroidData {
  id: string;
  name: string;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  is_potentially_hazardous_asteroid: boolean;
  close_approach_data: {
    close_approach_date: string;
    relative_velocity: {
      kilometers_per_hour: string;
    };
    miss_distance: {
      kilometers: string;
    };
  }[];
}

const DEMO_KEY = "DEMO_KEY";
const BASE_URL = "https://api.nasa.gov";

export async function fetchAPOD(date?: string): Promise<APODData> {
  const url = `${BASE_URL}/planetary/apod?api_key=${DEMO_KEY}${date ? `&date=${date}` : ""}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch APOD");
  return res.json();
}

export async function fetchAPODRange(startDate: string, endDate: string): Promise<APODData[]> {
  const url = `${BASE_URL}/planetary/apod?api_key=${DEMO_KEY}&start_date=${startDate}&end_date=${endDate}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch APOD range");
  return res.json();
}

export async function fetchAsteroids(startDate: string, endDate: string): Promise<AsteroidData[]> {
  const url = `${BASE_URL}/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${DEMO_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch asteroids");
  const data = await res.json();
  const allAsteroids: AsteroidData[] = [];
  for (const date in data.near_earth_objects) {
    allAsteroids.push(...data.near_earth_objects[date]);
  }
  return allAsteroids;
}
