"use client";

import { usePlayingState } from "@/hooks/useIsPlaying";

export default function BackgroundOrbs() {
  const isPlaying = usePlayingState((state) => state.isPlaying);

  return (
    <div
      className={`fixed inset-0 overflow-hidden pointer-events-none transition-opacity duration-1000 ${
        isPlaying ? "opacity-30" : "opacity-100"
      }`}
      style={{ zIndex: -1 }}
    >
      {/* Base Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#111113] to-[#050505]"></div>

      {/* Radial spotlight in center for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(157,157,57,0.06)_0%,transparent_70%)]"></div>

      {/* Vignette - darker edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]" style={{ zIndex: 0 }}></div>

      {/* ============= SVG CONSTELLATION LAYER (between bg and orbs) ============= */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.35]"
        style={{ zIndex: 1 }}
        viewBox="0 0 1920 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Network connection lines */}
        <g stroke="rgba(227,236,88,0.6)" strokeWidth="1">
          {/* Main constellation paths */}
          <line x1="120" y1="80" x2="350" y2="200" />
          <line x1="350" y1="200" x2="580" y2="150" />
          <line x1="580" y1="150" x2="750" y2="320" />
          <line x1="750" y1="320" x2="960" y2="280" />
          <line x1="960" y1="280" x2="1150" y2="180" />
          <line x1="1150" y1="180" x2="1380" y2="300" />
          <line x1="1380" y1="300" x2="1600" y2="220" />
          <line x1="1600" y1="220" x2="1820" y2="120" />

          {/* Secondary network */}
          <line x1="200" y1="500" x2="420" y2="620" />
          <line x1="420" y1="620" x2="680" y2="540" />
          <line x1="680" y1="540" x2="900" y2="700" />
          <line x1="900" y1="700" x2="1100" y2="600" />
          <line x1="1100" y1="600" x2="1350" y2="750" />
          <line x1="1350" y1="750" x2="1550" y2="650" />
          <line x1="1550" y1="650" x2="1780" y2="780" />

          {/* Bottom network */}
          <line x1="100" y1="850" x2="320" y2="920" />
          <line x1="320" y1="920" x2="550" y2="860" />
          <line x1="550" y1="860" x2="800" y2="980" />
          <line x1="800" y1="980" x2="1050" y2="900" />
          <line x1="1050" y1="900" x2="1300" y2="1020" />
          <line x1="1300" y1="1020" x2="1500" y2="950" />
          <line x1="1500" y1="950" x2="1750" y2="1050" />

          {/* Cross connections (vertical bridges) */}
          <line x1="350" y1="200" x2="420" y2="620" />
          <line x1="750" y1="320" x2="680" y2="540" />
          <line x1="960" y1="280" x2="900" y2="700" />
          <line x1="1150" y1="180" x2="1100" y2="600" />
          <line x1="1380" y1="300" x2="1350" y2="750" />
          <line x1="420" y1="620" x2="320" y2="920" />
          <line x1="900" y1="700" x2="800" y2="980" />
          <line x1="1100" y1="600" x2="1050" y2="900" />
          <line x1="1550" y1="650" x2="1500" y2="950" />

          {/* Diagonal accents */}
          <line x1="580" y1="150" x2="420" y2="620" />
          <line x1="1600" y1="220" x2="1550" y2="650" />
          <line x1="680" y1="540" x2="550" y2="860" />
          <line x1="1350" y1="750" x2="1300" y2="1020" />
        </g>

        {/* Constellation nodes (golden dots at intersections) */}
        <g fill="rgba(227,236,88,0.9)">
          {/* Top row */}
          <circle cx="120" cy="80" r="3.5" />
          <circle cx="350" cy="200" r="4" />
          <circle cx="580" cy="150" r="3" />
          <circle cx="750" cy="320" r="5" />
          <circle cx="960" cy="280" r="3.5" />
          <circle cx="1150" cy="180" r="4" />
          <circle cx="1380" cy="300" r="3" />
          <circle cx="1600" cy="220" r="4" />
          <circle cx="1820" cy="120" r="3.5" />

          {/* Middle row */}
          <circle cx="200" cy="500" r="3" />
          <circle cx="420" cy="620" r="5" />
          <circle cx="680" cy="540" r="3.5" />
          <circle cx="900" cy="700" r="4" />
          <circle cx="1100" cy="600" r="3" />
          <circle cx="1350" cy="750" r="5" />
          <circle cx="1550" cy="650" r="3.5" />
          <circle cx="1780" cy="780" r="3" />

          {/* Bottom row */}
          <circle cx="100" cy="850" r="3.5" />
          <circle cx="320" cy="920" r="3" />
          <circle cx="550" cy="860" r="4" />
          <circle cx="800" cy="980" r="3.5" />
          <circle cx="1050" cy="900" r="5" />
          <circle cx="1300" cy="1020" r="3" />
          <circle cx="1500" cy="950" r="4" />
          <circle cx="1750" cy="1050" r="3.5" />
        </g>

        {/* Larger glowing node accents (key intersections) */}
        <g>
          <circle cx="750" cy="320" r="18" fill="rgba(157,157,57,0.2)" />
          <circle cx="900" cy="700" r="22" fill="rgba(227,236,88,0.15)" />
          <circle cx="420" cy="620" r="16" fill="rgba(157,157,57,0.18)" />
          <circle cx="1350" cy="750" r="20" fill="rgba(167,230,0,0.12)" />
          <circle cx="1150" cy="180" r="18" fill="rgba(227,236,88,0.15)" />
        </g>
      </svg>

      {/* ============= GEOMETRIC PATTERNS (z-index: 2) ============= */}

      {/* Dot Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(227,236,88,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* Subtle cross-hatch lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(45deg, rgba(157,157,57,0.5) 1px, transparent 1px),
            linear-gradient(-45deg, rgba(157,157,57,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      ></div>

      {/* Horizontal scan lines (very subtle) */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(227,236,88,0.3) 2px, rgba(227,236,88,0.3) 3px)",
        }}
      ></div>

      {/* ============= DECORATIVE SHAPES ============= */}

      {/* Large ring — top right */}
      <div
        className="absolute -top-[5%] -right-[5%] w-[40vw] h-[40vw] rounded-full animate-drift-slow"
        style={{
          border: "1px solid rgba(157,157,57,0.08)",
          boxShadow: "inset 0 0 80px rgba(157,157,57,0.03)",
        }}
      ></div>

      {/* Medium ring — bottom left */}
      <div
        className="absolute bottom-[5%] -left-[8%] w-[30vw] h-[30vw] rounded-full animate-drift-reverse"
        style={{
          border: "1px solid rgba(227,236,88,0.06)",
          boxShadow: "inset 0 0 60px rgba(227,236,88,0.02)",
        }}
      ></div>

      {/* Small ring — center */}
      <div
        className="absolute top-[40%] left-[45%] w-[15vw] h-[15vw] rounded-full animate-pulse-slow"
        style={{
          border: "1px solid rgba(167,230,0,0.05)",
        }}
      ></div>

      {/* Diagonal accent line — top left to center */}
      <div
        className="absolute top-0 left-0 w-[70vw] h-[1px] origin-top-left rotate-[25deg] opacity-[0.06]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(227,236,88,0.6) 30%, rgba(227,236,88,0.6) 70%, transparent 100%)",
        }}
      ></div>

      {/* Diagonal accent line — bottom right */}
      <div
        className="absolute bottom-[20%] right-0 w-[50vw] h-[1px] origin-bottom-right rotate-[-20deg] opacity-[0.05]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(157,157,57,0.5) 40%, rgba(157,157,57,0.5) 60%, transparent 100%)",
        }}
      ></div>

      {/* ============= GLOWING ORBS ============= */}

      {/* Animated Orb 1 — Top Left (golden) */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full filter blur-[100px] animate-drift-slow"
        style={{
          background:
            "radial-gradient(circle, rgba(157,157,57,0.25) 0%, rgba(157,157,57,0) 70%)",
        }}
      ></div>

      {/* Animated Orb 2 — Bottom Right (dark-golden) */}
      <div
        className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full filter blur-[120px] animate-drift-reverse"
        style={{
          background:
            "radial-gradient(circle, rgba(227,236,88,0.15) 0%, rgba(227,236,88,0) 70%)",
        }}
      ></div>

      {/* Animated Orb 3 — Center Right (special green) */}
      <div
        className="absolute top-[30%] right-[15%] w-[30vw] h-[30vw] rounded-full filter blur-[80px] animate-pulse-slow"
        style={{
          background:
            "radial-gradient(circle, rgba(167,230,0,0.12) 0%, rgba(167,230,0,0) 70%)",
        }}
      ></div>

      {/* Small accent orb — Top Right (golden warm) */}
      <div
        className="absolute top-[10%] right-[5%] w-[15vw] h-[15vw] rounded-full filter blur-[60px] animate-drift-slow"
        style={{
          background:
            "radial-gradient(circle, rgba(227,236,88,0.1) 0%, transparent 70%)",
          animationDelay: "5s",
        }}
      ></div>

      {/* Small accent orb — Bottom Left (golden) */}
      <div
        className="absolute bottom-[15%] left-[5%] w-[20vw] h-[20vw] rounded-full filter blur-[70px] animate-pulse-slow"
        style={{
          background:
            "radial-gradient(circle, rgba(157,157,57,0.12) 0%, transparent 70%)",
          animationDelay: "3s",
        }}
      ></div>

      {/* Noise grain overlay */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
}
