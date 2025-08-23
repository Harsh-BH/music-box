import React from 'react';

const MusicNoteSVG = ({ className = "", size = 150 }) => {
  return (
    <div className={`music-notes-container relative ${className}`} style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="music-notes-svg absolute inset-0"
      >
        {/* Background circle */}
        <circle cx="100" cy="100" r="90" fill="#F3F4FF" />
        
        {/* Main eighth note */}
        <g className="animate-float" style={{ transformOrigin: 'center', animationDuration: '3s' }}>
          <path 
            d="M120 50V110C120 116.627 114.627 122 108 122C101.373 122 96 116.627 96 110C96 103.373 101.373 98 108 98C110 98 112 98.5 114 99.5V60L80 70V130C80 136.627 74.627 142 68 142C61.373 142 56 136.627 56 130C56 123.373 61.373 118 68 118C70 118 72 118.5 74 119.5V80L120 50Z" 
            fill="#6366F1" 
            stroke="#4F46E5" 
            strokeWidth="2"
          />
        </g>
        
        {/* Animated music notes */}
        <g className="animate-music-note" style={{ transformOrigin: 'center' }}>
          <path 
            d="M140 70L150 60M145 65L155 75" 
            stroke="#6366F1" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
        </g>
        <g className="animate-music-note-delay" style={{ animationDelay: '0.5s', transformOrigin: 'center' }}>
          <path 
            d="M50 90L60 80M55 85L65 95" 
            stroke="#6366F1" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
        </g>
        <g className="animate-music-note" style={{ animationDelay: '1s', transformOrigin: 'center' }}>
          <path 
            d="M130 130L140 120M135 125L145 135" 
            stroke="#6366F1" 
            strokeWidth="3" 
            strokeLinecap="round" 
          />
        </g>
      </svg>
    </div>
  );
};

export default MusicNoteSVG;
