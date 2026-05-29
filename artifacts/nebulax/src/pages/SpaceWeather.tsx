import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import GlassPanel from "../components/GlassPanel";
import {
  fetchSolarWind, fetchKpIndex, fetchXrayFlux, fetchNOAAAlerts,
  kpToStormCategory, fluxToFlareClass, alertColor, parseAlertTitle,
  type SolarWindPlasma, type KpReading, type XrayReading, type NOAAAlert,
} from "../services/spaceWeatherApi";

function fmtTime(t: string) {
  return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(t: string) {
  return new Date(t).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function LiveValue({ value, unit, label, color }: { value: string | number; unit: string; label: string; color?: string }) {
  return (
    <div className="text-center">
      <div
        className="text-3xl font-bold"
        style={{ fontFamily: "'Orbitron', monospace", color: color ?? "hsl(var(--secondary))" }}
      >
        {value}
        <span className="text-base ml-1 text-muted-foreground font-normal">{unit}</span>
      </div>
      <div className="text-xs text-muted-foreground uppercase tracking-widest mt-1">{label}</div>
    </div>
  );
}

function KpGauge({ kp }: { kp: number }) {
  const { label, color } = kpToStormCategory(kp);
  const pct = Math.min((kp / 9) * 100, 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-muted-foreground">Geomagnetic Activity</span>
        <span className="font-bold" style={{ color, fontFamily: "'Orbitron', monospace" }}>
          Kp {kp.toFixed(1)} — {label}
        </span>
      </div>
      <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, #00D4FF, ${color})` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>Quiet (0)</span><span>Extreme (9)</span>
      </div>
    </div>
  );
}

export default function SpaceWeather() {
  const [wind, setWind] = useState<SolarWindPlasma[]>([]);
  const [kp, setKp] = useState<KpReading[]>([]);
  const [xray, setXray] = useState<XrayReading[]>([]);
  const [alerts, setAlerts] = useState<NOAAAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function loadAll() {
    try {
      const [windData, kpData, xrayData, alertData] = await Promise.all([
        fetchSolarWind(),
        fetchKpIndex(),
        fetchXrayFlux(),
        fetchNOAAAlerts(),
      ]);
      setWind(windData);
      setKp(kpData);
      setXray(xrayData);
      setAlerts(alertData);
      setLastUpdated(new Date());
      setError(null);
    } catch {
      setError("Could not load space weather data. NOAA servers may be temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    const id = setInterval(loadAll, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  const windChart = wind.slice(-60).map(d => ({
    t: fmtTime(d.time_tag),
    speed: Math.round(d.speed),
    density: parseFloat(d.density.toFixed(2)),
  }));

  const kpChart = kp.slice(-90).map(d => ({
    t: fmtTime(d.time_tag),
    kp: parseFloat(d.estimated_kp.toFixed(1)),
  }));

  const xrayChart = xray.slice(-72).map(d => ({
    t: fmtTime(d.time_tag),
    flux: parseFloat((d.flux * 1e7).toFixed(3)), // scale to nW/m²
  }));

  const curKp = kp.length > 0 ? kp[kp.length - 1].estimated_kp : 0;
  const curSpeed = wind.length > 0 ? Math.round(wind[wind.length - 1].speed) : 0;
  const curDensity = wind.length > 0 ? wind[wind.length - 1].density.toFixed(1) : "—";
  const curTemp = wind.length > 0
    ? (wind[wind.length - 1].temperature / 1000).toFixed(0)
    : "—";
  const curFlux = xray.length > 0 ? xray[xray.length - 1].flux : 0;
  const { cls: flareClass, color: flareColor } = fluxToFlareClass(curFlux);
  const { color: stormColor } = kpToStormCategory(curKp);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="w-14 h-14 rounded-full border-2 border-transparent border-t-secondary animate-spin" />
        <p className="text-secondary text-sm tracking-widest uppercase" style={{ fontFamily: "'Orbitron', monospace" }}>
          Loading Space Weather...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <div className="text-5xl" style={{ color: "hsl(var(--accent))" }}>!</div>
        <p className="text-center text-muted-foreground max-w-md">{error}</p>
        <button
          className="px-6 py-2 rounded-full border border-primary text-primary hover:bg-primary hover:text-white transition-all"
          onClick={() => { setLoading(true); setError(null); loadAll(); }}
          data-testid="button-retry-weather"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 space-y-8 max-w-7xl">

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gradient-primary" style={{ fontFamily: "'Orbitron', monospace" }}>
            Space Weather
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Real-time solar activity · NOAA Space Weather Prediction Center</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-xs text-muted-foreground uppercase tracking-widest">
            Live · {lastUpdated ? lastUpdated.toLocaleTimeString() : "—"}
          </span>
        </div>
      </motion.div>

      {/* Active alerts */}
      {alerts.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-2" data-testid="section-alerts">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Active NOAA Alerts</p>
          {alerts.slice(0, 3).map((a, i) => {
            const title = parseAlertTitle(a.message);
            const c = alertColor(title);
            return (
              <div key={i} className="glass rounded-xl px-5 py-3 flex items-center gap-4" style={{ borderColor: c + "44", borderWidth: 1 }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c, boxShadow: `0 0 8px ${c}` }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{title}</p>
                  <p className="text-xs text-muted-foreground">{fmtDate(a.issue_datetime)}</p>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Current conditions strip */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <GlassPanel className="glow-secondary">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">Current Solar Wind &amp; Radiation</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
            <LiveValue value={curSpeed} unit="km/s" label="Wind Speed" />
            <LiveValue value={curDensity} unit="p/cm³" label="Proton Density" />
            <LiveValue value={curTemp} unit="K (×10³)" label="Temperature" />
            <LiveValue value={curKp.toFixed(1)} unit="" label="Kp Index" color={stormColor} />
            <LiveValue value={flareClass + "-class"} unit="" label="X-ray Activity" color={flareColor} />
          </div>
          <KpGauge kp={curKp} />
        </GlassPanel>
      </motion.div>

      {/* Solar wind + Kp charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassPanel>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Solar Wind Speed — Last 60 min</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={windChart}>
                <defs>
                  <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="t" tick={{ fill: "#555", fontSize: 10 }} interval={14} />
                <YAxis tick={{ fill: "#555", fontSize: 10 }} unit=" km/s" width={72} />
                <Tooltip contentStyle={{ background: "#0d1117", border: "1px solid #222", borderRadius: 8 }} itemStyle={{ color: "#00D4FF" }} labelStyle={{ color: "#888" }} />
                <Area type="monotone" dataKey="speed" stroke="#00D4FF" fill="url(#speedGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassPanel>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <GlassPanel>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Geomagnetic Kp Index — Last 90 min</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={kpChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="t" tick={{ fill: "#555", fontSize: 10 }} interval={17} />
                <YAxis domain={[0, 9]} tick={{ fill: "#555", fontSize: 10 }} />
                <Tooltip contentStyle={{ background: "#0d1117", border: "1px solid #222", borderRadius: 8 }} itemStyle={{ color: "#6D5DFC" }} labelStyle={{ color: "#888" }} />
                <Bar dataKey="kp" radius={[2, 2, 0, 0]}>
                  {kpChart.map((e, i) => (
                    <Cell key={i} fill={kpToStormCategory(e.kp).color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassPanel>
        </motion.div>
      </div>

      {/* Proton density + X-ray flux */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassPanel>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Proton Density — Last 60 min</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={windChart}>
                <defs>
                  <linearGradient id="densGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4D9D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FF4D9D" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="t" tick={{ fill: "#555", fontSize: 10 }} interval={14} />
                <YAxis tick={{ fill: "#555", fontSize: 10 }} unit=" p/cm³" width={72} />
                <Tooltip contentStyle={{ background: "#0d1117", border: "1px solid #222", borderRadius: 8 }} itemStyle={{ color: "#FF4D9D" }} labelStyle={{ color: "#888" }} />
                <Area type="monotone" dataKey="density" stroke="#FF4D9D" fill="url(#densGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </GlassPanel>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <GlassPanel>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">GOES X-ray Flux (0.1–0.8 nm) — 6 hr</p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={xrayChart}>
                <defs>
                  <linearGradient id="xrayGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffc107" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ffc107" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="t" tick={{ fill: "#555", fontSize: 10 }} interval={17} />
                <YAxis tick={{ fill: "#555", fontSize: 10 }} unit=" nW" width={60} />
                <Tooltip
                  contentStyle={{ background: "#0d1117", border: "1px solid #222", borderRadius: 8 }}
                  itemStyle={{ color: "#ffc107" }}
                  labelStyle={{ color: "#888" }}
                  formatter={(v: number) => [`${v} nW/m²`, "X-ray Flux"]}
                />
                <Area type="monotone" dataKey="flux" stroke="#ffc107" fill="url(#xrayGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">Flux scaled to nW/m² · Higher values indicate stronger flare activity</p>
          </GlassPanel>
        </motion.div>
      </div>

      {/* Storm scale reference */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <GlassPanel>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-5">NOAA Geomagnetic Storm Scale Reference</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { level: "G1", kp: 5, label: "Minor", color: "#a0ff00", effects: "Weak power grid fluctuations, minor satellite drag" },
              { level: "G2", kp: 6, label: "Moderate", color: "#ffc107", effects: "Voltage corrections, HF radio fades at high latitudes" },
              { level: "G3", kp: 7, label: "Strong", color: "#ff7043", effects: "Grid false alarms, aurora visible at mid-latitudes" },
              { level: "G4", kp: 8, label: "Severe", color: "#FF4D9D", effects: "Widespread control problems, satellite outages possible" },
              { level: "G5", kp: 9, label: "Extreme", color: "#ff0000", effects: "Grid collapse possible, HF radio blackout worldwide" },
            ].map(g => (
              <div key={g.level} className="rounded-xl p-4 text-center" style={{ background: g.color + "11", border: `1px solid ${g.color}33` }}>
                <div className="text-2xl font-bold mb-1" style={{ color: g.color, fontFamily: "'Orbitron', monospace" }}>{g.level}</div>
                <div className="text-xs font-semibold mb-1" style={{ color: g.color }}>{g.label}</div>
                <div className="text-xs text-muted-foreground mb-2">Kp ≥ {g.kp}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{g.effects}</div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </motion.div>

      <p className="text-center text-xs text-muted-foreground pb-6">
        Data from NOAA Space Weather Prediction Center · Refreshes every 5 minutes
      </p>
    </div>
  );
}
