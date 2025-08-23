import React from 'react';

const LyricsDisplay = ({ currentLyric, nextLyric }) => {
  return (
    <div className="my-8 w-full flex flex-col items-center">
      <div className="bg-white p-6 rounded-lg shadow-md border-2 border-indigo-100 mb-4 min-h-[100px] w-full flex items-center justify-center animate-highlight">
        <p className="text-2xl font-bold text-gray-800 text-center">
          {currentLyric}
        </p>
      </div>
      
      <div className="text-gray-500 italic text-center min-h-[30px]">
        Coming up: {nextLyric}
      </div>
      
      <div className="mt-4">
        <svg width="50" height="30" viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M5 5C10 15 15 25 25 25C35 25 40 15 45 5" 
            stroke="#6366F1" 
            strokeWidth="3" 
            strokeLinecap="round"
            className="animate-pulse"
          />
        </svg>
      </div>
    </div>
  );
};

export default LyricsDisplay;
