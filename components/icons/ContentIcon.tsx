import React from "react";

export function ContentIcon({ className, ...props } : React.SVGProps<SVGSVGElement>){
    return(
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 16 16" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={`w-4 h-4 ${className || ''}`}
            {...props}
            >
            <path d="M2.75 14h5.5"></path>
            <path d="M10.747 14h2.503"></path>
            <path d="M4.75 11.249h6.5a3 3 0 0 0 3-3v-3.499a3 3 0 0 0-3-3h-6.5a3 3 0 0 0-3 3v3.498a3 3 0 0 0 3 3"></path>
            <path fill="currentColor" stroke="none" d="M5.125 6.25a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25"></path>
            <path d="m3.5 11 5.296-4.074a2 2 0 0 1 2.42-.015l2.784 2.089"></path>
        </svg>
    );
}