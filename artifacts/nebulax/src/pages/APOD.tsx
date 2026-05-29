import React, { useEffect, useState } from "react";
import { fetchAPOD, APODData } from "../services/nasaApi";
import Loader from "../components/Loader";
import GlassPanel from "../components/GlassPanel";
import { formatDate } from "../utils/formatters";

export default function APOD() {
  const [data, setData] = useState<APODData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAPOD()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="text-destructive text-center py-20">Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-orbitron mb-8 text-gradient-primary">Astronomy Picture of the Day</h1>
      <GlassPanel className="mb-8">
        <h2 className="text-2xl font-bold mb-2">{data.title}</h2>
        <p className="text-muted-foreground mb-6">{formatDate(data.date)}</p>
        
        {data.media_type === "image" ? (
          <img src={data.url} alt={data.title} className="w-full rounded-lg mb-6 object-cover max-h-[70vh]" />
        ) : (
          <iframe src={data.url} className="w-full aspect-video rounded-lg mb-6" />
        )}
        
        <p className="text-lg leading-relaxed">{data.explanation}</p>
        
        <div className="mt-8">
          <a href={data.hdurl || data.url} target="_blank" rel="noopener noreferrer" className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold glow-primary inline-block">
            View Full Res
          </a>
        </div>
      </GlassPanel>
    </div>
  );
}
