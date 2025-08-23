import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ScoreCard from '../components/challenge/ScoreCard';
import ConfettiSVG from '../components/svgs/ConfettiSVG';
import '../styles/ScorePage.css';

const ScorePage = () => {
  const { songId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const scores = location.state?.scores || {};
  const song = location.state?.song || {};
  
  // Convert scores object to array and sort by score value
  const scoresList = Object.entries(scores)
    .map(([user, score]) => ({ user: `Player ${user}`, score }))
    .sort((a, b) => b.score - a.score);
  
  const handlePlayAgain = () => {
    navigate(`/challenge/${songId}`, { state: { song } });
  };
  
  const handleReturnToMusic = () => {
    navigate('/music');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FED770] to-[#FEE9B0] py-12 px-4 flex flex-col items-center">
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl font-bold text-center mb-6 text-indigo-800">Game Results</h1>
        
        <div className="flex justify-center mb-8">
          <ConfettiSVG size={180} />
        </div>
        
        {song.title && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{song.title}</h2>
            <p className="text-gray-600">{song.artist}</p>
          </div>
        )}
        
        {scoresList.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-xl shadow-md mb-8 border-2 border-yellow-300">
            <div className="flex flex-col items-center">
              <div className="bg-yellow-400 text-white rounded-full w-16 h-16 flex items-center justify-center mb-4 animate-bounce">
                <span className="text-2xl">🏆</span>
              </div>
              <h2 className="text-2xl font-bold text-center text-yellow-700">
                {scoresList[0].user} wins with {scoresList[0].score} points!
              </h2>
            </div>
          </div>
        )}
        
        <div className="space-y-4 mb-10 w-full">
          {scoresList.map((playerScore, index) => (
            <ScoreCard 
              key={index}
              rank={index + 1}
              playerName={playerScore.user}
              score={playerScore.score}
            />
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <button 
            onClick={handlePlayAgain}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md"
          >
            Play Again
          </button>
          <button 
            onClick={handleReturnToMusic}
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md"
          >
            Return to Music
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScorePage;
