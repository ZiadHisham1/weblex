import React from 'react';

export interface VideoHeroProps {
  videoUrl: string;
  posterUrl?: string;
  title: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText: string;
  secondaryButtonLink: string;
}

export function VideoHero({
  videoUrl = '',
  posterUrl = '',
  title = 'EXPLORE HOW THE CREATIVES\nDESIGN THERE INTERNAL\nVERSES',
  primaryButtonText = 'explore',
  primaryButtonLink = '#',
  secondaryButtonText = 'shop by category',
  secondaryButtonLink = '#',
}: VideoHeroProps) {
  
  const titleLines = title.split('\n');

  return (
    <section className="relative w-full h-[100vh] min-h-[600px] flex items-center overflow-hidden">
      
      {/* 1. Video Background */}
      {videoUrl ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={posterUrl}
          className="absolute inset-0 w-full h-full object-cover object-center z-0"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 bg-gray-800 z-0" />
      )}

      {/* 2. Content Container */}
      <div className="relative z-20 w-full max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 flex flex-col items-start justify-center pt-24">
        
        <h1 className="text-5xl md:text-6xl lg:text-[80px] font-medium text-white leading-[1.1] mb-8 drop-shadow-md">
          {titleLines.map((line, index) => (
            <span key={index} className="block">
              {line}
            </span>
          ))}
        </h1>

        <div className="flex flex-row flex-wrap items-center gap-4">
          <a
            href={primaryButtonLink}
            className="px-8 py-3.5 bg-black text-white text-lg rounded-xl font-medium hover:bg-gray-800 transition-colors duration-300 shadow-lg"
          >
            {primaryButtonText}
          </a>
          <a
            href={secondaryButtonLink}
            className="px-8 py-3.5 bg-white/40 backdrop-blur-md border border-white/50 text-black text-lg rounded-xl font-medium hover:bg-white/60 transition-colors duration-300 shadow-sm"
          >
            {secondaryButtonText}
          </a>
        </div>
      </div>
    </section>
  );
}