import React from 'react';

const ScoreCard = ({ rank, playerName, score }) => {
  const isWinner = rank === 1;
  
  return (
    <div className={`
      flex items-center justify-between p-4 rounded-lg shadow-md transition-all duration-300 hover:-translate-y-1
      ${isWinner 
        ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-300' 
        : 'bg-white border border-gray-200'}
    `}>
      <div className="flex items-center">
        <div className={`
          w-10 h-10 rounded-full flex items-center justify-center font-bold text-white
          ${isWinner ? 'bg-yellow-500' : 'bg-indigo-600'}
        `}>
          #{rank}
        </div>
        <div className="ml-4 font-semibold text-lg">{playerName}</div>
      </div>
      
      <div className={`
        font-bold text-xl
        ${isWinner ? 'text-yellow-700' : 'text-green-600'}
      `}>
        {score} points
        {isWinner && <span className="ml-2">🏆</span>}
      </div>
    </div>
  );
};

export default ScoreCard;
