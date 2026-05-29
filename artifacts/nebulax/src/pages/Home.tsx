import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import GlassPanel from "../components/GlassPanel";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-[80vh]">
      <motion.h1 
        className="text-5xl md:text-7xl font-orbitron font-bold text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Explore the <span className="text-gradient-primary">Universe</span><br />
        in Real Time
      </motion.h1>
      <p className="text-xl text-muted-foreground text-center mb-10 max-w-2xl">
        Access live NASA data, track the ISS, and explore near-Earth asteroids from your personal mission control.
      </p>
      <div className="flex gap-4 mb-20">
        <Link href="/apod" className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold glow-primary hover:scale-105 transition-transform">
          Start Exploring
        </Link>
        <Link href="/iss" className="glass px-8 py-3 rounded-full font-bold hover:bg-white/5 transition-colors">
          View ISS Live
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
        {[
          { title: "APOD", desc: "Astronomy Picture of the Day", link: "/apod", color: "primary" },
          { title: "ISS Tracker", desc: "Live position of the Space Station", link: "/iss", color: "secondary" },
          { title: "Asteroids", desc: "Near-Earth Object watch", link: "/asteroids", color: "accent" },
          { title: "Solar System", desc: "3D Explorer", link: "/solar-system", color: "primary" }
        ].map((feat) => (
          <Link href={feat.link} key={feat.title}>
            <GlassPanel className="h-full hover:scale-105 transition-transform cursor-pointer" glowColor={feat.color as any}>
              <h3 className="text-xl font-orbitron font-bold mb-2">{feat.title}</h3>
              <p className="text-muted-foreground text-sm">{feat.desc}</p>
            </GlassPanel>
          </Link>
        ))}
      </div>
    </div>
  );
}
