import React from "react";

export default function Loader() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center">
      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p className="mt-4 font-orbitron tracking-widest text-primary animate-pulse">LOADING...</p>
    </div>
  );
}
