import React from 'react';

const PlayButton = ({ onStart }) => {
  return (
    <button 
      onClick={onStart}
      className="group bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-full transition duration-300 shadow-md hover:shadow-lg flex items-center space-x-3 transform hover:-translate-y-1 relative"
    >
      <span className="absolute inset-0 rounded-full bg-indigo-400 opacity-0 group-hover:opacity-30 group-hover:animate-ping"></span>
      <span className="relative">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 3L19 12L5 21V3Z" fill="currentColor" />
        </svg>
      </span>
      <span className="text-xl tracking-wide relative">Start Challenge</span>
    </button>
  );
};

export default PlayButton;
