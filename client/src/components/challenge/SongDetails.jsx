import React from 'react';

const SongDetails = ({ song }) => {
  if (!song) return null;
  
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-[250px] rounded-lg overflow-hidden shadow-lg mb-6 transition-transform duration-300 hover:scale-105">
        <img 
          src={song.albumCover} 
          alt={`${song.title} album cover`}
          className="w-full h-auto object-cover"
        />
      </div>
      
      <div className="w-full">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">{song.title}</h2>
        
        <div className="space-y-2 text-gray-700">
          <p className="flex justify-between">
            <span className="font-medium">Artist:</span>
            <span>{song.artist}</span>
          </p>
          <p className="flex justify-between">
            <span className="font-medium">Duration:</span>
            <span>{song.duration}</span>
          </p>
          <p className="flex justify-between">
            <span className="font-medium">Genre:</span>
            <span>{song.genre}</span>
          </p>
          <p className="flex justify-between">
            <span className="font-medium">Difficulty:</span>
            <span className="flex items-center">
              {song.difficulty === "Easy" && "⭐"}
              {song.difficulty === "Medium" && "⭐⭐"}
              {song.difficulty === "Hard" && "⭐⭐⭐"}
              <span className="ml-1">{song.difficulty}</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SongDetails;
