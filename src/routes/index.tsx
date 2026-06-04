import { createFileRoute, Link } from "@tanstack/react-router";
import { MoveRight, Shield, UserPlus, Cpu, Radio, Terminal, Award } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Command Intake — 4 Infantry Battalion" },
      { name: "description", content: "Tactical Registry and Command Intake Portal for the Mighty Fourth Infantry Battalion." },
    ],
  }),
  component: MilitaryHomepage,
});

function MilitaryHomepage() {
  return (
    <div className="min-h-screen bg-[#80B2C9] text-[#0a1824] font-mono overflow-hidden flex flex-col relative select-none">
      
      {/* Grid Overlay / Radar Scanlines */}
      <div 
        className="absolute inset-0 opacity-[0.08] pointer-events-none z-0" 
        style={{
          backgroundImage: `
            linear-gradient(to right, #0a1824 1px, transparent 1px),
            linear-gradient(to bottom, #0a1824 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px"
        }}
      />

      {/* Pulsing Scanline overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1824]/0 via-[#0a1824]/4 to-[#0a1824]/0 pointer-events-none z-10 w-full h-[300%] animate-[scan_8s_linear_infinite]" />

      {/* Rotating Radar Crosshair decoration in the bottom-left */}
      <div className="absolute bottom-[-150px] left-[-150px] w-[600px] h-[600px] opacity-[0.12] pointer-events-none z-0">
        <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full animate-[spin_40s_linear_infinite]">
          <circle cx="100" cy="100" r="95" stroke="#0a1824" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="70" stroke="#0a1824" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="45" stroke="#0a1824" strokeWidth="0.5" strokeDasharray="2 2" />
          <line x1="100" y1="0" x2="100" y2="200" stroke="#0a1824" strokeWidth="0.5" />
          <line x1="0" y1="100" x2="200" y2="100" stroke="#0a1824" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Main Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen relative z-10">
        
        {/* Left Column - Terminal Interface */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 md:p-12 lg:p-20 border-r border-[#0a1824]/15 relative">
          
          {/* Corner Decors for tactical terminal look */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[#0a1824]/40" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#0a1824]/40 lg:hidden" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-[#0a1824]/40" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#0a1824]/40 lg:hidden" />

          {/* Navigation Bar */}
          <header className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-lg bg-[#0a1824]/10 border border-[#0a1824]/30 flex items-center justify-center shadow-[0_0_10px_rgba(10,24,36,0.15)] group-hover:border-[#0a1824] transition-colors duration-300">
                <Shield size={20} className="text-[#0a1824] animate-pulse" />
              </div>
              <div>
                <span className="font-black text-lg tracking-wider text-[#0a1824]">MIGHTY FOURTH</span>
                <span className="block text-[9px] font-bold text-[#0a1824]/70 tracking-widest mt-0.5">SECURE PORTAL</span>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6 text-[11px] font-bold tracking-widest text-[#1f3c54]">
              <Link to="/enroll" className="flex items-center gap-1.5 hover:text-[#0a1824] transition-colors duration-200 uppercase">
                <UserPlus size={12} /> Registry
              </Link>
              <Link to="/admin" className="flex items-center gap-1.5 hover:text-[#0a1824] transition-colors duration-200 uppercase">
                <Terminal size={12} /> Console
              </Link>
              <a href="#sys-status" className="flex items-center gap-1.5 hover:text-[#0a1824] transition-colors duration-200 uppercase">
                <Cpu size={12} /> Status
              </a>
            </nav>

            <Link
              to="/enroll"
              className="md:hidden text-[10px] font-black uppercase tracking-wider bg-[#0a1824] text-[#80B2C9] px-3 py-1.5 rounded border border-[#0a1824]"
            >
              Enroll
            </Link>
          </header>

          {/* Main Hero Terminal Body */}
          <main className="my-auto py-12 lg:py-0 max-w-[580px]">
            {/* System Tag */}
            <div className="inline-flex items-center gap-2 border border-[#0a1824]/20 bg-[#0a1824]/5 px-3.5 py-1.5 rounded-md text-[10px] uppercase tracking-[0.25em] text-[#0a1824] mb-8 font-semibold shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0a1824] animate-ping" />
              <span>4 Infantry Battalion Registry</span>
            </div>

            {/* Headline (Battalion Motto) */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-[#0a1824] uppercase mb-6 font-mono">
              Home of
              <br />
              the
              <br />
              <span className="text-white bg-[#0a1824] px-4 py-1.5 inline-block rounded shadow-[0_4px_12px_rgba(10,24,36,0.15)]">Determined</span>
            </h1>

            {/* Subtext */}
            <p className="text-[#1f3c54] text-sm md:text-base leading-relaxed mb-10 border-l-2 border-[#0a1824]/40 pl-4 py-1 italic font-semibold">
              "We Never Give Up." Secure digital registry intake terminal for enlistment credentials, platoon structures, and deployment manifests. Authorized military personnel only.
            </p>

            {/* CTA Button Grid */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/enroll"
                className="inline-flex items-center justify-center bg-[#0a1824] hover:bg-[#1a3449] text-[#80B2C9] font-black text-xs uppercase tracking-[0.2em] px-8 py-4.5 rounded border border-[#0a1824] transition-all duration-300 shadow-[0_4px_12px_rgba(10,24,36,0.15)] hover:shadow-[0_6px_20px_rgba(10,24,36,0.25)] hover:translate-y-[-2px] active:translate-y-[0px] gap-2"
              >
                <UserPlus size={16} />
                Enroll
              </Link>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#0a1824] hover:text-white px-5 py-4 border border-[#0a1824]/20 hover:border-[#0a1824] rounded transition-all duration-300 bg-[#0a1824]/5 hover:bg-[#0a1824]"
              >
                Command Portal <MoveRight size={14} className="animate-pulse" />
              </Link>
            </div>
          </main>

          {/* Footer Console Log Info */}
          <footer className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[10px] text-[#1f3c54]/70 tracking-wider">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Radio size={12} className="text-[#0a1824]/70" /> UPLINK: SECURE</span>
              <span>•</span>
              <span className="flex items-center gap-1.5"><Award size={12} className="text-[#0a1824]/70" /> REGISTRY ACTIVE</span>
            </div>
            <div>
              [SYS_VER: 2026.06]
            </div>
          </footer>
        </div>

        {/* Right Column - Insignia & Tactical Diagnostics Display */}
        <div className="lg:col-span-5 bg-[#0a1824] border-l border-[#80B2C9]/15 flex items-center justify-center p-6 md:p-12 lg:p-0 relative min-h-[450px] lg:min-h-screen">
          
          {/* Corner Decors for Right Column */}
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-[#80B2C9]/40 hidden lg:block" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[#80B2C9]/40 hidden lg:block" />

          {/* Cybernetic grid accents */}
          <div className="absolute top-10 left-10 w-24 h-[1px] bg-[#80B2C9]/10" />
          <div className="absolute top-10 left-10 w-[1px] h-24 bg-[#80B2C9]/10" />
          
          <div className="absolute bottom-10 right-10 w-24 h-[1px] bg-[#80B2C9]/10" />
          <div className="absolute bottom-10 right-10 w-[1px] h-24 bg-[#80B2C9]/10" />

          {/* Main Insignia HUD Monitor Widget */}
          <div className="relative w-full max-w-[350px] md:max-w-[390px] bg-[#0d2235]/90 rounded-2xl border border-[#80B2C9]/20 p-5 flex flex-col justify-between shadow-[0_0_30px_rgba(128,178,201,0.06)] overflow-hidden group">
            
            {/* Monitor Top Status bar */}
            <div className="flex items-center justify-between text-[9px] text-[#80B2C9]/70 tracking-widest mb-4">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#80B2C9] animate-pulse" />
                <span>SYS_UP: 99.87%</span>
              </div>
              <div>
                <span>SEC_GRID // 04_INF</span>
              </div>
            </div>

            {/* Insignia Image Border Frame with corner details */}
            <div className="relative rounded-lg overflow-hidden border border-[#80B2C9]/30 aspect-[4/3] bg-black">
              {/* Target Crosshair brackets inside frame */}
              <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t border-l border-[#80B2C9]" />
              <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t border-r border-[#80B2C9]" />
              <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b border-l border-[#80B2C9]" />
              <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b border-r border-[#80B2C9]" />

              <img
                src="/images.jpg"
                alt="4 Infantry Battalion Insignia"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-80"
              />
              
              {/* Scanline CRT overlay filter */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none" />
              
              <div className="absolute inset-0 bg-[#80B2C9]/5 group-hover:bg-transparent transition-colors" />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent" />

              {/* Coordinates display bottom left */}
              <div className="absolute bottom-2.5 left-3 text-white">
                <div className="text-[8px] text-[#80B2C9] tracking-widest font-black uppercase">LOC: KUMASI, GH</div>
                <div className="text-[10px] font-bold font-mono tracking-tight mt-0.5">6.6906° N, 1.6287° W</div>
              </div>
            </div>

            {/* Tactical Diagnostics details widget below image */}
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-[#8892b0]">SIGNAL RANGE</span>
                <span className="font-bold text-[#80B2C9] tracking-widest">4.8 GHz [ACTIVE]</span>
              </div>
              <div className="h-[1px] bg-[#80B2C9]/15" />
              
              <div className="grid grid-cols-2 gap-2 text-[9px]">
                <div className="border border-[#80B2C9]/15 bg-[#80B2C9]/5 px-2.5 py-1.5 rounded">
                  <div className="text-[#80B2C9]/70 uppercase">STRENGTH</div>
                  <div className="font-black mt-0.5 text-white">BATTALION</div>
                </div>
                <div className="border border-[#80B2C9]/15 bg-[#80B2C9]/5 px-2.5 py-1.5 rounded">
                  <div className="text-[#80B2C9]/70 uppercase">DESIGNATION</div>
                  <div className="font-black mt-0.5 text-white">MIGHTY FOURTH</div>
                </div>
              </div>

              <div className="h-[1px] bg-[#80B2C9]/15" />
              
              <Link
                to="/enroll"
                className="w-full flex items-center justify-between border border-[#80B2C9]/30 hover:border-[#80B2C9] bg-[#80B2C9]/10 hover:bg-[#80B2C9]/20 text-[#80B2C9] hover:text-white px-3 py-2.5 rounded text-[10px] font-bold uppercase tracking-widest transition-all duration-300"
              >
                <span>OPEN REGISTRY CHANNEL</span>
                <MoveRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
