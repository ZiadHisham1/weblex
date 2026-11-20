import React from 'react';
import { Globe, User, ShoppingCart } from 'lucide-react';

export interface GlassyNavbarProps {
  logoText: string;
  logoAccent: string;
  links: { label: string; url: string }[];
  showGlobe: boolean;
  showUser: boolean;
  showCart: boolean;
  cartCount?: number;
  // Optional: control the text color if the background is very light
  textColor?: 'dark' | 'light'; 
}

export function GlassyNavbar({
  logoText = 'HOME',
  logoAccent = '.IO',
  links = [],
  showGlobe = true,
  showUser = true,
  showCart = true,
  cartCount = 0,
  textColor = 'dark',
}: GlassyNavbarProps) {
  
  const isLight = textColor === 'light';
  
  return (
    // The 'absolute top-0 left-0 w-full z-50' makes it float over the next section
    <header className="mx-00 top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 md:px-12 backdrop-blur-md bg-white/10 border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.1),inset_2px_2px_8px_0_rgba(255,255,255,0.4)]">
      
      {/* <div className='mx-4'> */}
        {/* Logo Section */}
        <div className="flex items-center cursor-pointer group">
          <h1 className={`text-2xl md:text-3xl font-black tracking-tighter transition-transform duration-300 group-hover:scale-105 drop-shadow-sm ${isLight ? 'text-white' : 'text-gray-900'}`}>
            {logoText}
            <span className={`font-semibold tracking-normal transition-colors ${isLight ? 'text-white/70 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-800'}`}>
              {logoAccent}
            </span>
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link, index) => (
            <a
              key={index}
              href={link.url}
              className={`relative text-sm font-medium capitalize transition-all duration-300 hover:-translate-y-[1px] ${
                isLight 
                  ? 'text-white/90 hover:text-white drop-shadow-md' 
                  : 'text-gray-700 hover:text-black drop-shadow-sm'
              }`}
            >
              {link.label}
              <span className={`absolute -bottom-1 left-0 w-0 h-[2px] transition-all duration-300 hover:w-full ${isLight ? 'bg-white' : 'bg-gray-900'}`}></span>
            </a>
          ))}
        </nav>

        {/* Action Icons */}
        <div className={`flex items-center gap-5 ${isLight ? 'text-white' : 'text-gray-700'}`}>
          {showGlobe && (
            <button className="transition-all duration-300 hover:scale-110 hover:drop-shadow-md" aria-label="Language">
              <Globe className="w-5 h-5 stroke-[1.5]" />
            </button>
          )}
          
          {showUser && (
            <button className="transition-all duration-300 hover:scale-110 hover:drop-shadow-md" aria-label="User Profile">
              <User className="w-5 h-5 stroke-[1.5]" />
            </button>
          )}

          {showCart && (
            <button className="transition-all duration-300 hover:scale-110 hover:drop-shadow-md relative" aria-label="Shopping Cart">
              <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          )}
      </div>
    </header>
  );
}