import React from 'react';

const WaveSVG = ({ className = "", size = 150 }) => {
  return (
    <div className={`wave-container relative ${className}`} style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="wave-svg"
      >
        {/* Background circle */}
        <circle cx="100" cy="100" r="90" fill="#F3F4FF" />
        
        {/* Sound waves */}
        <g className="sound-waves">
          {/* Center dot */}
          <circle cx="100" cy="100" r="10" fill="#6366F1" className="animate-pulse" />
          
          {/* Wave 1 */}
          <path 
            d="M70 100C70 83.4315 83.4315 70 100 70C116.569 70 130 83.4315 130 100C130 116.569 116.569 130 100 130C83.4315 130 70 116.569 70 100Z" 
            stroke="#6366F1" 
            strokeWidth="3" 
            strokeDasharray="5 5"
            className="animate-ping opacity-75"
            style={{ animationDuration: '3s' }}
          />
          
          {/* Wave 2 */}
          <path 
            d="M50 100C50 72.3858 72.3858 50 100 50C127.614 50 150 72.3858 150 100C150 127.614 127.614 150 100 150C72.3858 150 50 127.614 50 100Z" 
            stroke="#6366F1" 
            strokeWidth="2" 
            strokeDasharray="7 7"
            className="animate-ping opacity-50"
            style={{ animationDuration: '4s', animationDelay: '0.5s' }}
          />
          
          {/* Wave 3 */}
          <path 
            d="M30 100C30 61.3401 61.3401 30 100 30C138.66 30 170 61.3401 170 100C170 138.66 138.66 170 100 170C61.3401 170 30 138.66 30 100Z" 
            stroke="#6366F1" 
            strokeWidth="2" 
            strokeDasharray="10 10"
            className="animate-ping opacity-25"
            style={{ animationDuration: '5s', animationDelay: '1s' }}
          />
        </g>
      </svg>
    </div>
  );
};

export default WaveSVG;
