import React from "react";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="glass mt-20 py-8 text-center text-muted-foreground text-sm">
      <p>Built with NASA's Open APIs</p>
      <p className="mt-2">&copy; {new Date().getFullYear()} NebulaX</p>
    </footer>
  );
}
