import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react'; // Only ArrowRight is safe

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterProps {
  productLinks: FooterLink[];
  exploreLinks: FooterLink[];
  companyLinks: FooterLink[];
  subscribeTitle: string;
  subscribeDescription: string;
  subscribeButtonText: string;
  legalLinks: FooterLink[];
  socialLinks: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
  };
}

export function Footer({
  productLinks = [],
  exploreLinks = [],
  companyLinks = [],
  subscribeTitle = 'Subscribe',
  subscribeDescription = 'Join our newsletter for design inspiration.',
  subscribeButtonText = 'Subscribe',
  legalLinks = [],
  socialLinks = {},
}: FooterProps) {
  return (
    <footer className="w-full bg-[#0A0A0A] text-white pt-20 pb-8 border-t border-gray-800">
      <div className="max-w-[1200px] mx-auto px-6 md:px-8">
        
        {/* Top Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Product */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm tracking-wide">Product</h4>
            <ul className="space-y-4">
              {productLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.url} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm tracking-wide">Explore</h4>
            <ul className="space-y-4">
              {exploreLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.url} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-white font-semibold mb-6 text-sm tracking-wide">Company</h4>
            <ul className="space-y-4">
              {companyLinks.map((link, i) => (
                <li key={i}>
                  <Link href={link.url} className="text-gray-400 hover:text-white transition-colors text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Subscribe */}
          <div className="bg-[#121212] w-fit p-8 rounded-xl h-fit">
            <h4 className="text-white font-semibold mb-6 text-sm tracking-wide">{subscribeTitle}</h4>
            
            <form className="flex items-center mb-6" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Email address" 
                className="flex-1 bg-[#1A1A1A] text-white placeholder-gray-500 px-4 py-3 text-sm rounded-l-md border border-gray-700 border-r-0 focus:outline-none focus:border-gray-500 transition-colors"
                required
              />
              <button 
                type="submit"
                className="bg-[#FDF8E9] text-black px-4 py-3 rounded-r-md hover:bg-white transition-colors border border-[#FDF8E9]"
                aria-label={subscribeButtonText}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            
            <p className="text-xs text-gray-500 leading-relaxed">
              {subscribeDescription}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gray-800 mb-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center">
            <span className="border border-dashed border-gray-600 text-gray-500 text-sm font-bold px-6 py-2 rounded">
              HOME.IO
            </span>
          </div>

          <div className="flex items-center gap-8">
            {legalLinks.map((link, i) => (
              <Link key={i} href={link.url} className="text-gray-400 hover:text-white transition-colors text-xs font-medium">
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social Icons - Pure Inline SVGs */}
          <div className="flex items-center gap-3">
            {socialLinks.linkedin && (
              <a href={socialLinks.linkedin} target="_blank" rel="noreferrer" className="bg-[#1A1A1A] p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            )}
            
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noreferrer" className="bg-[#1A1A1A] p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
            )}

            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noreferrer" className="bg-[#1A1A1A] p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}