import React, { useEffect, useState } from "react";
import { fetchAsteroids, AsteroidData } from "../services/nasaApi";
import Loader from "../components/Loader";
import GlassPanel from "../components/GlassPanel";
import { formatNumber, getHazardLevel } from "../utils/formatters";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from "recharts";

export default function Asteroids() {
  const [data, setData] = useState<AsteroidData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("approach");

  useEffect(() => {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 7);
    
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    fetchAsteroids(startStr, endStr)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="text-destructive text-center py-20">Error: {error}</div>;

  const filteredData = data.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
  
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortBy === "approach") {
      return parseFloat(a.close_approach_data[0]?.miss_distance.kilometers) - parseFloat(b.close_approach_data[0]?.miss_distance.kilometers);
    }
    if (sortBy === "size") {
      return b.estimated_diameter.kilometers.estimated_diameter_max - a.estimated_diameter.kilometers.estimated_diameter_max;
    }
    if (sortBy === "speed") {
      return parseFloat(b.close_approach_data[0]?.relative_velocity.kilometers_per_hour) - parseFloat(a.close_approach_data[0]?.relative_velocity.kilometers_per_hour);
    }
    return 0;
  });

  const chartData = sortedData.slice(0, 10).map(a => ({
    name: a.name,
    distance: parseFloat(a.close_approach_data[0]?.miss_distance.kilometers) / 1000000, // in millions km
    size: a.estimated_diameter.kilometers.estimated_diameter_max * 1000, // in meters
    speed: parseFloat(a.close_approach_data[0]?.relative_velocity.kilometers_per_hour),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-orbitron mb-4 text-gradient-accent">Near-Earth Asteroids</h1>
      <p className="text-muted-foreground mb-8">Showing closest approaches over the next 7 days.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <GlassPanel>
          <h3 className="text-lg font-orbitron mb-4">Top 10 Closest Approaches (Million km)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#888" fontSize={12} tickFormatter={(val) => val.substring(0, 8)} />
                <YAxis stroke="#888" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#050816', border: '1px solid #333' }} />
                <Bar dataKey="distance" fill="#00D4FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
        
        <GlassPanel>
          <h3 className="text-lg font-orbitron mb-4">Size vs Speed Correlation</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis type="number" dataKey="size" name="Size (m)" stroke="#888" fontSize={12} />
                <YAxis type="number" dataKey="speed" name="Speed (km/h)" stroke="#888" fontSize={12} />
                <ZAxis type="number" range={[50, 400]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#050816', border: '1px solid #333' }} />
                <Scatter name="Asteroids" data={chartData} fill="#FF4D9D" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input 
          type="text" 
          placeholder="Search asteroids..." 
          className="bg-card/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary w-full md:w-64"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select 
          className="bg-card/50 border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary w-full md:w-48"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          <option value="approach">Sort by Closest Approach</option>
          <option value="size">Sort by Largest Size</option>
          <option value="speed">Sort by Highest Speed</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedData.map(ast => {
          const approach = ast.close_approach_data[0];
          const hazard = getHazardLevel(ast);
          return (
            <GlassPanel key={ast.id} className={hazard === 'hazard' ? 'border-accent glow-accent' : ''}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold">{ast.name}</h3>
                {hazard === 'hazard' ? (
                  <span className="bg-accent/20 text-accent px-2 py-1 rounded text-xs font-bold border border-accent/50">HAZARD</span>
                ) : (
                  <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/50">SAFE</span>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Est. Diameter:</span>
                  <span>{formatNumber(ast.estimated_diameter.kilometers.estimated_diameter_max)} km</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Velocity:</span>
                  <span>{formatNumber(parseFloat(approach?.relative_velocity.kilometers_per_hour))} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Miss Distance:</span>
                  <span>{formatNumber(parseFloat(approach?.miss_distance.kilometers))} km</span>
                </div>
              </div>
            </GlassPanel>
          )
        })}
      </div>
    </div>
  );
}
