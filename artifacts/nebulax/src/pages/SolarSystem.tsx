import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { motion } from "framer-motion";
import GlassPanel from "../components/GlassPanel";

const PLANETS = [
  { name: "Mercury", radius: 0.15, distance: 3, color: 0x888888, speed: 0.04, type: "Terrestrial", moons: 0, distanceAU: "0.39 AU", diameter: "4,879 km", fact: "Smallest planet, closest to the Sun. A day on Mercury lasts 59 Earth days." },
  { name: "Venus", radius: 0.3, distance: 5, color: 0xe3bb76, speed: 0.015, type: "Terrestrial", moons: 0, distanceAU: "0.72 AU", diameter: "12,104 km", fact: "Spins backwards compared to most planets. Surface temperature: 465°C." },
  { name: "Earth", radius: 0.35, distance: 7, color: 0x2b82c9, speed: 0.01, type: "Terrestrial", moons: 1, distanceAU: "1.00 AU", diameter: "12,742 km", fact: "The only planet known to harbor life. 71% of the surface is covered by water." },
  { name: "Mars", radius: 0.25, distance: 9, color: 0xc1440e, speed: 0.008, type: "Terrestrial", moons: 2, distanceAU: "1.52 AU", diameter: "6,779 km", fact: "Home to Olympus Mons, the tallest mountain in the solar system at 21.9 km." },
  { name: "Jupiter", radius: 0.9, distance: 13, color: 0xd39c7e, speed: 0.002, type: "Gas Giant", moons: 95, distanceAU: "5.20 AU", diameter: "139,820 km", fact: "The Great Red Spot is a storm larger than Earth, raging for over 350 years." },
  { name: "Saturn", radius: 0.75, distance: 17, color: 0xead6b8, speed: 0.0009, type: "Gas Giant", moons: 146, distanceAU: "9.58 AU", diameter: "116,460 km", fact: "Saturn's rings are made of ice and rock, and are only 10-100 meters thick.", hasRings: true },
  { name: "Uranus", radius: 0.5, distance: 21, color: 0x4fd1d9, speed: 0.0004, type: "Ice Giant", moons: 27, distanceAU: "19.2 AU", diameter: "50,724 km", fact: "Rotates on its side with an axial tilt of 97.8 degrees." },
  { name: "Neptune", radius: 0.48, distance: 25, color: 0x274687, speed: 0.0001, type: "Ice Giant", moons: 16, distanceAU: "30.1 AU", diameter: "49,244 km", fact: "Has the fastest winds in the solar system, reaching 2,100 km/h." }
];

function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  } catch {
    return false;
  }
}

// CSS fallback when WebGL is not available
function SolarSystemFallback({ onSelectPlanet, selectedPlanet }: { onSelectPlanet: (p: typeof PLANETS[0] | null) => void, selectedPlanet: typeof PLANETS[0] | null }) {
  const CSS_PLANETS = [
    { name: "Mercury", size: 10, orbit: 90, color: "#8a8a8a", duration: 4 },
    { name: "Venus", size: 18, orbit: 120, color: "#e3bb76", duration: 6 },
    { name: "Earth", size: 20, orbit: 155, color: "#2b82c9", duration: 10 },
    { name: "Mars", size: 14, orbit: 195, color: "#c1440e", duration: 16 },
    { name: "Jupiter", size: 48, orbit: 260, color: "#d39c7e", duration: 28 },
    { name: "Saturn", size: 40, orbit: 330, color: "#ead6b8", duration: 45 },
    { name: "Uranus", size: 28, orbit: 390, color: "#4fd1d9", duration: 80 },
    { name: "Neptune", size: 26, orbit: 445, color: "#274687", duration: 160 },
  ];

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden" style={{ background: "#050816" }}>
      <style>{`
        @keyframes orbit {
          from { transform: rotate(var(--start-angle)) translateX(var(--orbit-radius)) rotate(calc(-1 * var(--start-angle))); }
          to { transform: rotate(calc(var(--start-angle) + 360deg)) translateX(var(--orbit-radius)) rotate(calc(-1 * (var(--start-angle) + 360deg))); }
        }
        .planet-orbit-wrapper {
          position: absolute;
          width: 0;
          height: 0;
          animation: orbit var(--orbit-duration) linear infinite;
        }
        .orbit-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.06);
          transform: translate(-50%, -50%);
        }
      `}</style>

      {/* Sun */}
      <div className="absolute rounded-full z-10" style={{
        width: 70, height: 70,
        background: "radial-gradient(circle at 35% 35%, #fff5b0, #ffaa00, #ff6600)",
        boxShadow: "0 0 60px 20px rgba(255,150,0,0.6), 0 0 120px 40px rgba(255,100,0,0.3)",
      }} />

      {/* Orbit rings */}
      {CSS_PLANETS.map(p => (
        <div key={`ring-${p.name}`} className="orbit-ring" style={{
          width: p.orbit * 2, height: p.orbit * 2,
          left: "50%", top: "50%",
        }} />
      ))}

      {/* Planets */}
      {CSS_PLANETS.map((p, i) => {
        const startAngle = (i * 45) % 360;
        const data = PLANETS[i];
        return (
          <div
            key={p.name}
            className="planet-orbit-wrapper"
            style={{
              left: "50%", top: "50%",
              ["--orbit-radius" as string]: `${p.orbit}px`,
              ["--orbit-duration" as string]: `${p.duration}s`,
              ["--start-angle" as string]: `${startAngle}deg`,
            }}
          >
            <div
              className="absolute cursor-pointer rounded-full transition-all duration-200"
              style={{
                width: p.size, height: p.size,
                background: p.name === "Saturn"
                  ? `radial-gradient(circle at 35% 35%, ${p.color}dd, ${p.color}88)`
                  : `radial-gradient(circle at 35% 35%, ${p.color}ff, ${p.color}88)`,
                boxShadow: `0 0 8px 2px ${p.color}66`,
                transform: "translate(-50%, -50%)",
                border: selectedPlanet?.name === p.name ? "2px solid #6D5DFC" : "none",
              }}
              onClick={() => onSelectPlanet(selectedPlanet?.name === p.name ? null : data)}
              data-testid={`planet-${p.name.toLowerCase()}`}
            />
          </div>
        );
      })}

      <p className="absolute bottom-6 text-center text-muted-foreground text-sm">
        Click any planet to learn more — drag to orbit in a WebGL-capable browser
      </p>
    </div>
  );
}

export default function SolarSystem() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<typeof PLANETS[0] | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [webglSupported] = useState(() => isWebGLAvailable());
  const [webglError, setWebglError] = useState(false);
  const isPausedRef = useRef(isPaused);
  const speedRef = useRef(speedMultiplier);

  useEffect(() => {
    isPausedRef.current = isPaused;
    speedRef.current = speedMultiplier;
  }, [isPaused, speedMultiplier]);

  useEffect(() => {
    if (!webglSupported || !mountRef.current) return;

    let renderer: THREE.WebGLRenderer;

    try {
      const scene = new THREE.Scene();

      const starsGeometry = new THREE.BufferGeometry();
      const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.05 });
      const starsVertices: number[] = [];
      for (let i = 0; i < 5000; i++) {
        starsVertices.push(
          THREE.MathUtils.randFloatSpread(200),
          THREE.MathUtils.randFloatSpread(200),
          THREE.MathUtils.randFloatSpread(200)
        );
      }
      starsGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starsVertices, 3));
      scene.add(new THREE.Points(starsGeometry, starsMaterial));

      const sunGeo = new THREE.SphereGeometry(1.5, 32, 32);
      const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
      scene.add(new THREE.Mesh(sunGeo, sunMat));

      const sunLight = new THREE.PointLight(0xffffff, 2, 100);
      scene.add(sunLight);
      scene.add(new THREE.AmbientLight(0x222222));

      const planetMeshes: { mesh: THREE.Mesh; data: typeof PLANETS[0]; angle: number }[] = [];

      PLANETS.forEach(data => {
        const geo = new THREE.SphereGeometry(data.radius, 32, 32);
        const mat = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.5 });
        const mesh = new THREE.Mesh(geo, mat);

        // Orbit ring
        const ringGeo = new THREE.RingGeometry(data.distance - 0.02, data.distance + 0.02, 128);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x334455, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
        const orbitRing = new THREE.Mesh(ringGeo, ringMat);
        orbitRing.rotation.x = Math.PI / 2;
        scene.add(orbitRing);

        if (data.hasRings) {
          const sRingGeo = new THREE.RingGeometry(data.radius * 1.4, data.radius * 2.2, 64);
          const sRingMat = new THREE.MeshStandardMaterial({ color: 0xd4c5b0, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
          const sRing = new THREE.Mesh(sRingGeo, sRingMat);
          sRing.rotation.x = Math.PI / 3;
          mesh.add(sRing);
        }

        scene.add(mesh);
        planetMeshes.push({ mesh, data, angle: Math.random() * Math.PI * 2 });
      });

      const camera = new THREE.PerspectiveCamera(45, mountRef.current!.clientWidth / mountRef.current!.clientHeight, 0.1, 1000);
      camera.position.set(0, 20, 40);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(mountRef.current!.clientWidth, mountRef.current!.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mountRef.current!.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onClick = (event: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(planetMeshes.map(p => p.mesh));
        if (hits.length > 0) {
          const planet = planetMeshes.find(p => p.mesh === hits[0].object);
          if (planet) setSelectedPlanet(prev => prev?.name === planet.data.name ? null : planet.data);
        } else {
          setSelectedPlanet(null);
        }
      };
      window.addEventListener("click", onClick);

      let animId: number;
      const animate = () => {
        animId = requestAnimationFrame(animate);
        if (!isPausedRef.current) {
          planetMeshes.forEach(p => {
            p.angle += p.data.speed * speedRef.current;
            p.mesh.position.x = Math.cos(p.angle) * p.data.distance;
            p.mesh.position.z = Math.sin(p.angle) * p.data.distance;
            p.mesh.rotation.y += 0.01;
          });
        }
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        if (!mountRef.current) return;
        camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      };
      window.addEventListener("resize", onResize);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("click", onClick);
        if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
          mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    } catch {
      setWebglError(true);
    }
  }, [webglSupported]);

  const useFallback = !webglSupported || webglError;

  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden">
      {useFallback ? (
        <SolarSystemFallback onSelectPlanet={setSelectedPlanet} selectedPlanet={selectedPlanet} />
      ) : (
        <div ref={mountRef} className="absolute inset-0 cursor-move" />
      )}

      {/* Controls (only for 3D mode) */}
      {!useFallback && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 glass px-6 py-4 rounded-full flex items-center gap-4 z-20">
          <button
            className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold glow-primary"
            onClick={() => setIsPaused(p => !p)}
            data-testid="button-pause-play"
          >
            {isPaused ? "PLAY" : "PAUSE"}
          </button>
          <div className="flex items-center gap-2 text-sm text-white">
            <span>Speed:</span>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={speedMultiplier}
              onChange={e => setSpeedMultiplier(parseFloat(e.target.value))}
              className="accent-primary"
              data-testid="slider-speed"
            />
            <span className="w-6">{speedMultiplier.toFixed(1)}x</span>
          </div>
        </div>
      )}

      {/* Planet info panel */}
      {selectedPlanet && (
        <motion.div
          className="absolute top-8 right-8 w-80 z-30"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 30 }}
        >
          <GlassPanel className="glow-primary" data-testid={`panel-planet-${selectedPlanet.name.toLowerCase()}`}>
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-2xl font-bold text-gradient-primary" style={{ fontFamily: "'Orbitron', monospace" }}>
                {selectedPlanet.name}
              </h2>
              <button
                className="text-muted-foreground hover:text-white text-lg leading-none"
                onClick={() => setSelectedPlanet(null)}
                data-testid="button-close-planet-panel"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="text-secondary font-medium">{selectedPlanet.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Distance</span>
                <span>{selectedPlanet.distanceAU}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diameter</span>
                <span>{selectedPlanet.diameter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Moons</span>
                <span>{selectedPlanet.moons}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-sm text-muted-foreground italic leading-relaxed">{selectedPlanet.fact}</p>
            </div>
          </GlassPanel>
        </motion.div>
      )}

      {/* Planet list legend */}
      <div className="absolute top-8 left-8 z-20">
        <GlassPanel className="w-44">
          <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">Planets</p>
          <div className="space-y-1">
            {PLANETS.map(p => (
              <button
                key={p.name}
                className="w-full flex items-center gap-2 text-sm py-1 hover:text-white text-muted-foreground transition-colors"
                onClick={() => setSelectedPlanet(prev => prev?.name === p.name ? null : p)}
                data-testid={`button-planet-${p.name.toLowerCase()}`}
              >
                <span
                  className="inline-block rounded-full flex-shrink-0"
                  style={{ width: 8, height: 8, background: `#${p.color.toString(16).padStart(6, "0")}` }}
                />
                {p.name}
              </button>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  );
}
