import React from "react";

export function TrendingGrid({
  title,
  items,
}: {
  title: string;
  items: {
    imageUrl: string;
    tag?: string;
    link?: string;
  }[];
}) {
  return (
    <section className="py-16 px-4 md:px-8 max-w-[1600px] mx-auto w-full bg-[#f7f7f7]">
      {/* Section Title */}
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6 uppercase">
        {title}
      </h2>

      {/* Grid Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {items.map((item, index) => (
          <a
            key={index}
            href={item.link || "#"}
            className="relative block w-full aspect-[3/4] bg-gray-200 overflow-hidden group rounded-sm"
          >
            {/* Background Image with Zoom Effect */}
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.tag || `Trending ${index + 1}`}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Image Placeholder
              </div>
            )}

            {/* Floating Tag (Only shows if tag exists) */}
            {item.tag && (
              <div className="absolute top-1/2 left-0 -translate-y-1/2">
                <span className="bg-black/60 backdrop-blur-md text-white text-xs font-semibold tracking-wider px-4 py-2 border border-white/20 border-l-0 shadow-lg">
                  {item.tag}
                </span>
              </div>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}