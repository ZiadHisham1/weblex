import React from "react";

export function LuxuryHero({ 
  subtitle, 
  title, 
  description, 
  buttonText, 
  buttonUrl, 
  backgroundImage 
}: { 
  subtitle: string; 
  title: string; 
  description: string; 
  buttonText: string; 
  buttonUrl: string; 
  backgroundImage: string;
}) {
  // Check if the uploaded file is a video (mp4, webm, ogg)
  const isVideo = backgroundImage?.match(/\.(mp4|webm|ogg)$/i);

  return (
    <section className="relative flex flex-col items-center justify-center text-center min-h-[600px] md:min-h-[800px] px-4 py-24 overflow-hidden">
      
      {/* 1. Background Image / Video */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          {isVideo ? (
            <video 
              src={backgroundImage} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover" 
            />
          ) : (
            <img 
              src={backgroundImage} 
              alt="Hero Background" 
              className="w-full h-full object-cover" 
            />
          )}
        </div>
      )}

      {/* 2. Dark Overlay (Helps text stand out against the image) */}
      <div className="absolute inset-0 z-10 bg-black/30" />

      {/* 3. Content (z-20 keeps it above the overlay) */}
      <div className="relative z-20 flex flex-col items-center">
        {/* Top Subtitle */}
        <span className="text-xs md:text-sm font-medium uppercase tracking-[0.2em] text-white/90 mb-6 drop-shadow-md">
          {subtitle}
        </span>

        {/* Main Serif Title */}
        <h1 
          className="text-5xl md:text-7xl font-serif text-white leading-[1.1] mb-6 max-w-4xl mx-auto drop-shadow-lg"
          dangerouslySetInnerHTML={{ __html: title }} 
        />

        {/* Description */}
        <p className="text-base md:text-lg text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
          {description}
        </p>

        {/* Button */}
        <a 
          href={buttonUrl}
          className="inline-block bg-white text-black text-xs font-semibold tracking-widest uppercase px-8 py-4 hover:bg-gray-200 transition-colors"
        >
          {buttonText}
        </a>
      </div>

    </section>
  );
}