import React from "react";
import { ArrowRight } from "lucide-react"; // Make sure you have lucide-react installed

export function SynthHero({
  logoText,
  navLinks,
  buttonText,
  bgText,
  accentText1,
  accentText2,
  subtitle,
  bottomLeftTitle,
  bottomLeftText,
  floatingTitle,
  floatingText,
  bgImage,
}: {
  logoText: string;
  navLinks: { label: string; url: string }[];
  buttonText: string;
  bgText: string;
  accentText1: string;
  accentText2: string;
  subtitle: string;
  bottomLeftTitle: string;
  bottomLeftText: string;
  floatingTitle: string;
  floatingText: string;
  bgImage: string;
}) {
  return (
    <section className="relative w-full h-[100vh] min-h-[700px] bg-[#0a0a0a] overflow-hidden flex flex-col font-sans select-none">
      
      {/* 1. Atmospheric Background */}
      <div 
        className="absolute inset-0 opacity-1 bg-cover bg-center mix-blend-luminosity"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

      {/* 2. Top Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-6 text-white w-full  mx-auto">
        <div className="font-bold tracking-[0.3em] text-sm uppercase">{logoText}</div>
        
        <div className="hidden md:flex gap-8 text-sm text-gray-300">
          {navLinks.map((link, i) => (
            <a key={i} href={link.url} className="hover:text-white transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        <button className="border border-gray-500 rounded-full px-6 py-2 text-sm text-white hover:bg-white hover:text-black transition-colors">
          {buttonText}
        </button>
      </nav>

      {/* 3. Giant Background Typography */}
      <div className="absolute inset-0 flex items-center justify-center z-0 overflow-hidden pointer-events-none">
        <h1 className="text-[25vw] font-black text-white/[0.03] leading-none whitespace-nowrap tracking-tighter">
          {bgText}
        </h1>
      </div>

      {/* 4. Center Product Image */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[300px] md:w-[500px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* <img 
          src="https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000&auto=format&fit=crop" 
          alt="Product" 
          className="w-full h-auto object-contain mask-image"
        /> */}
      </div>

      {/* 5. Neon Accents (Handwritten Style) */}
      {/* 
        Note: To get the exact handwritten look, you'd need a font like 'Permanent Marker' or 'Caveat'. 
        Here I'm using a standard cursive fallback.
      */}
      <div className="absolute top-[35%] left-[10%] md:left-[15%] z-20 text-[#8b3dff] font-['Caveat',cursive] text-5xl md:text-7xl -rotate-6 drop-shadow-[0_0_15px_rgba(139,61,255,0.5)]">
        {accentText1}
      </div>
      
      <div className="absolute top-[45%] right-[10%] md:right-[15%] z-20 text-[#8b3dff] font-['Caveat',cursive] text-5xl md:text-7xl rotate-3 drop-shadow-[0_0_15px_rgba(139,61,255,0.5)]">
        {accentText2}
      </div>

      <div className="absolute top-[55%] left-[15%] z-20 text-white font-['Caveat',cursive] text-2xl md:text-4xl -rotate-2">
        {subtitle}
      </div>

      {/* 6. Bottom Left Text */}
      <div className="absolute bottom-12 left-8 md:left-12 z-30 text-white max-w-xs">
        <h3 className="font-bold tracking-widest uppercase mb-3 text-sm">{bottomLeftTitle}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{bottomLeftText}</p>
      </div>

      {/* 7. Bottom Right Floating Card */}
      <div className="absolute bottom-12 right-8 md:right-12 z-30 bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 max-w-[220px]">
        <h3 className="font-bold text-white uppercase tracking-wider text-sm mb-2">{floatingTitle}</h3>
        <p className="text-gray-400 text-xs leading-relaxed mb-4">{floatingText}</p>
        <a href="#" className="flex items-center gap-2 text-white text-xs font-medium hover:text-gray-300 transition-colors">
          See more info
          <span className="flex items-center justify-center w-5 h-5 rounded-full border border-gray-500">
            <ArrowRight className="w-3 h-3" />
          </span>
        </a>
      </div>

    </section>
  );
}