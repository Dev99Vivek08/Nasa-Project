import React from "react";
import { Link, useLocation } from "wouter";

export default function Navbar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Home" },
    { href: "/apod", label: "APOD" },
    { href: "/iss", label: "ISS" },
    { href: "/asteroids", label: "Asteroids" },
    { href: "/solar-system", label: "Solar System" },
    { href: "/about", label: "About" },
  ];

  return (
    <nav className="sticky top-0 z-50 glass border-b-0">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-orbitron font-bold text-gradient-primary">
          NebulaX
        </Link>
        <div className="hidden md:flex gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm uppercase tracking-wider font-medium transition-colors ${
                location === link.href ? "text-primary glow-primary" : "text-muted-foreground hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
