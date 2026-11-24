import React from "react";

export function ProductsIcon({ className, props } : React.SVGProps<SVGSVGElement>){
    return(
       <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 16 16" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={`w-4 h-4 ${ className || ''}`}
            {...props}
            >
            <path d="m11.946 2.616 1.596 3.451a1.5 1.5 0 0 1-.025 1.313l-3.074 6.008a1.5 1.5 0 0 1-2.022.65l-5.333-2.747a1.5 1.5 0 0 1-.647-2.018l3.075-5.995a1.5 1.5 0 0 1 1.052-.789l3.734-.717a1.5 1.5 0 0 1 1.644.844"></path>
            <circle cx="9.512" cy="5.5" r="1" fill="currentColor" stroke="none"></circle>
        </svg>
    );
}