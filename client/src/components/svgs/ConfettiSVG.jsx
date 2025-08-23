import React from 'react';

const ConfettiSVG = ({ className = "", size = 150 }) => {
  return (
    <div className={`confetti-container relative ${className}`} style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="confetti-svg"
      >
        {/* Background circle */}
        <circle cx="100" cy="100" r="90" fill="#FEF9C3" />
        
        {/* Trophy */}
        <g className="animate-float" style={{ transformOrigin: 'center', animationDuration: '3s' }}>
          <path 
            d="M80 120H120M100 100V120M120 60V50H80V60M80 60C80 75.6 90 90 100 90C110 90 120 75.6 120 60M120 60H130V50H120M80 60H70V50H80" 
            stroke="#F59E0B" 
            strokeWidth="4" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </g>
        
        {/* Confetti pieces */}
        <g className="confetti-pieces">
          {/* Piece 1 */}
          <rect 
            x="40" y="40" width="10" height="3" rx="1" 
            fill="#EF4444" 
            className="animate-confetti-1"
            style={{ transformOrigin: 'center' }}
          />
          
          {/* Piece 2 */}
          <rect 
            x="150" y="50" width="8" height="3" rx="1" 
            fill="#3B82F6" 
            className="animate-confetti-2"
            style={{ transformOrigin: 'center', animationDelay: '0.2s' }}
          />
          
          {/* Piece 3 */}
          <rect 
            x="60" y="150" width="12" height="3" rx="1" 
            fill="#10B981" 
            className="animate-confetti-1"
            style={{ transformOrigin: 'center', animationDelay: '0.5s' }}
          />
          
          {/* Piece 4 */}
          <rect 
            x="140" y="130" width="10" height="3" rx="1" 
            fill="#F59E0B" 
            className="animate-confetti-2"
            style={{ transformOrigin: 'center', animationDelay: '0.7s' }}
          />
          
          {/* Piece 5 */}
          <circle 
            cx="50" cy="100" r="4" 
            fill="#8B5CF6" 
            className="animate-confetti-3"
            style={{ transformOrigin: 'center', animationDelay: '0.3s' }}
          />
          
          {/* Piece 6 */}
          <circle 
            cx="150" cy="90" r="3" 
            fill="#EC4899" 
            className="animate-confetti-3"
            style={{ transformOrigin: 'center', animationDelay: '0.6s' }}
          />
          
          {/* Piece 7 */}
          <path 
            d="M40 80L48 75L46 83L40 80Z" 
            fill="#6366F1" 
            className="animate-confetti-4"
            style={{ transformOrigin: 'center', animationDelay: '0.1s' }}
          />
          
          {/* Piece 8 */}
          <path 
            d="M160 110L168 105L166 113L160 110Z" 
            fill="#D97706" 
            className="animate-confetti-4"
            style={{ transformOrigin: 'center', animationDelay: '0.4s' }}
          />
        </g>
      </svg>
    </div>
  );
};

export default ConfettiSVG;
