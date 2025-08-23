import React from 'react';

const MicrophoneSVG = ({ className = "", size = 120, isActive = false }) => {
  return (
    <div className={`microphone-container relative ${className}`} style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="microphone-svg"
      >
        {/* Background circle */}
        <circle cx="100" cy="100" r="90" fill="#F3F4FF" />
        
        {/* Microphone */}
        <g className={isActive ? "animate-float" : ""} style={{ transformOrigin: 'center' }}>
          <path 
            d="M100 40C88.9543 40 80 48.9543 80 60V100C80 111.046 88.9543 120 100 120C111.046 120 120 111.046 120 100V60C120 48.9543 111.046 40 100 40Z" 
            fill="#E0E7FF" 
            stroke="#6366F1" 
            strokeWidth="4"
          />
          
          <path 
            d="M60 90V100C60 122.091 77.9086 140 100 140C122.091 140 140 122.091 140 100V90" 
            stroke="#6366F1" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          
          <path 
            d="M100 140V160" 
            stroke="#6366F1" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
          
          <path 
            d="M70 160H130" 
            stroke="#6366F1" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </g>
        
        {/* Sound waves when active */}
        {isActive && (
          <>
            <circle 
              cx="50" 
              cy="90" 
              r="4" 
              fill="#6366F1"
              className="animate-ping opacity-75"
              style={{ animationDuration: '1.5s' }}
            />
            
            <circle 
              cx="150" 
              cy="90" 
              r="4" 
              fill="#6366F1"
              className="animate-ping opacity-75"
              style={{ animationDuration: '1.5s', animationDelay: '0.5s' }}
            />
            
            <path 
              d="M60 70C66.6667 63.3333 80 53.3333 100 53.3333C120 53.3333 133.333 63.3333 140 70" 
              stroke="#6366F1" 
              strokeWidth="2" 
              strokeLinecap="round"
              strokeDasharray="4 4"
              className="animate-pulse"
              style={{ animationDuration: '2s' }}
            />
            
            <path 
              d="M50 60C60 50 76.6667 36.6667 100 36.6667C123.333 36.6667 140 50 150 60" 
              stroke="#6366F1" 
              strokeWidth="2" 
              strokeLinecap="round"
              strokeDasharray="4 4"
              className="animate-pulse"
              style={{ animationDuration: '2.5s', animationDelay: '0.3s' }}
            />
          </>
        )}
      </svg>
    </div>
  );
};

export default MicrophoneSVG;
