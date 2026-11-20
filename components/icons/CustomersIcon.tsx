import React from "react";

export function CustomersIcon({ className, props } : React.SVGProps<SVGElement>){
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
            <circle cx="8" cy="4.25" r="2.5"></circle>
            <path d="m2.815 11.815.094-.137a6.178 6.178 0 0 1 10.182 0l.094.137a1.082 1.082 0 0 1-.55 1.64l-.345.115a13.57 13.57 0 0 1-8.58 0l-.346-.115a1.082 1.082 0 0 1-.55-1.64"></path>
        </svg>
    );
}