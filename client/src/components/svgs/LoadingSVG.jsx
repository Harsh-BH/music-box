import React from 'react';

const LoadingSVG = ({ className = "", size = 120 }) => {
  return (
    <div className={`loading-container relative ${className}`} style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="loading-svg"
      >
        {/* Background circle */}
        <circle cx="100" cy="100" r="90" fill="#F3F4FF" />
        
        {/* Outer circle */}
        <circle 
          cx="100" 
          cy="100" 
          r="70" 
          stroke="#E0E7FF" 
          strokeWidth="8" 
        />
        
        {/* Spinning arc */}
        <path 
          d="M100 30C61.3401 30 30 61.3401 30 100C30 138.66 61.3401 170 100 170" 
          stroke="#6366F1" 
          strokeWidth="8" 
          strokeLinecap="round"
          className="origin-center animate-spin"
          style={{ animationDuration: '1.5s' }} 
        />
        
        {/* Inner pulse circle */}
        <circle 
          cx="100" 
          cy="100" 
          r="20" 
          fill="#6366F1"
          className="animate-pulse" 
          style={{ animationDuration: '1.2s' }}
        />
        
        {/* Decorative dots */}
        <circle 
          cx="100" 
          cy="30" 
          r="5" 
          fill="#6366F1"
        />
        
        <circle 
          cx="100" 
          cy="170" 
          r="5" 
          fill="#6366F1"
          className="animate-pulse"
          style={{ animationDuration: '1.2s', animationDelay: '0.3s' }}
        />
        
        <circle 
          cx="30" 
          cy="100" 
          r="5" 
          fill="#6366F1"
          className="animate-pulse"
          style={{ animationDuration: '1.2s', animationDelay: '0.6s' }}
        />
        
        <circle 
          cx="170" 
          cy="100" 
          r="5" 
          fill="#6366F1"
          className="animate-pulse"
          style={{ animationDuration: '1.2s', animationDelay: '0.9s' }}
        />
      </svg>
    </div>
  );
};

export default LoadingSVG;
