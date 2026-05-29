import { useState, useEffect } from "react";
import { fetchISSPosition, fetchAstronauts, ISSPosition, Astronaut } from "../services/issApi";

export function useISSTracker() {
  const [position, setPosition] = useState<ISSPosition | null>(null);
  const [astronauts, setAstronauts] = useState<Astronaut[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadInitial() {
      try {
        const [pos, astros] = await Promise.all([fetchISSPosition(), fetchAstronauts()]);
        if (mounted) {
          setPosition(pos);
          setAstronauts(astros);
          setLastUpdated(Date.now());
        }
      } catch (err: any) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadInitial();

    const interval = setInterval(async () => {
      try {
        const pos = await fetchISSPosition();
        if (mounted) {
          setPosition(pos);
          setLastUpdated(Date.now());
        }
      } catch (err: any) {
        console.error("Poll error", err);
      }
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { position, astronauts, isLoading, error, lastUpdated };
}
