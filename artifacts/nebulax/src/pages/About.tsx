import React from "react";
import GlassPanel from "../components/GlassPanel";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-4xl font-orbitron mb-8 text-gradient-primary text-center">About NebulaX</h1>
      <GlassPanel>
        <h2 className="text-2xl font-bold mb-4">A student's love letter to space</h2>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          NebulaX is a personal passion project that makes NASA's real data feel cinematic. 
          It's the kind of dashboard a space-obsessed student builds over several late nights — functional, beautiful, and slightly over-engineered in the best way.
        </p>
        <h3 className="text-xl font-bold mb-2">Tech Stack</h3>
        <ul className="list-disc list-inside text-muted-foreground mb-6 ml-4 space-y-1">
          <li>React & Vite</li>
          <li>Tailwind CSS</li>
          <li>Framer Motion</li>
          <li>NASA APIs (APOD, NeoWs)</li>
          <li>Open Notify (ISS Tracker)</li>
        </ul>
        <p className="text-center italic mt-10">"Built by a curious developer who thinks space is really, really cool."</p>
      </GlassPanel>
    </div>
  );
}
