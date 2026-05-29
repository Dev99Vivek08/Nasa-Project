import React from "react";
import { useISSTracker } from "../hooks/useISSTracker";
import Loader from "../components/Loader";
import GlassPanel from "../components/GlassPanel";

export default function ISS() {
  const { position, astronauts, isLoading, error } = useISSTracker();

  if (isLoading) return <Loader />;
  if (error) return <div className="text-destructive text-center py-20">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-4xl font-orbitron text-gradient-secondary">ISS Live Tracker</h1>
        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-sm font-bold border border-red-500/50">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          LIVE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassPanel glowColor="secondary">
          <p className="text-muted-foreground text-sm font-orbitron">LATITUDE</p>
          <p className="text-3xl font-mono">{position?.latitude.toFixed(4)}°</p>
        </GlassPanel>
        <GlassPanel glowColor="secondary">
          <p className="text-muted-foreground text-sm font-orbitron">LONGITUDE</p>
          <p className="text-3xl font-mono">{position?.longitude.toFixed(4)}°</p>
        </GlassPanel>
        <GlassPanel glowColor="secondary">
          <p className="text-muted-foreground text-sm font-orbitron">ALTITUDE</p>
          <p className="text-3xl font-mono">~408 km</p>
        </GlassPanel>
      </div>

      <GlassPanel className="mb-8">
        <h2 className="text-2xl font-orbitron mb-4 text-secondary">Crew Aboard ({astronauts.length})</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {astronauts.map((a, i) => (
            <li key={i} className="glass p-4 rounded flex items-center justify-between">
              <span className="font-bold">{a.name}</span>
              <span className="text-xs text-muted-foreground">{a.craft}</span>
            </li>
          ))}
        </ul>
      </GlassPanel>
    </div>
  );
}
