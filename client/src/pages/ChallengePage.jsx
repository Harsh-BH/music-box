import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SongDetails from '../components/challenge/SongDetails';
import PlayButton from '../components/challenge/PlayButton';
import MusicNoteSVG from '../components/svgs/MusicNoteSVG';
import LoadingSVG from '../components/svgs/LoadingSVG';
import { getSongDetails } from '../services/api';

const ChallengePage = () => {
  const { songId } = useParams();
  const navigate = useNavigate();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSongDetails = async () => {
      setLoading(true);
      try {
        const response = await getSongDetails(songId);
        if (response.error) {
          setError(response.error);
        } else {
          // Transform API response to match our component's expected format
          const songData = response.song;
          
          // Create a properly formatted song object
          setSong({
            id: songId,
            title: songData.title || "Unknown Title",
            artist: songData.artists?.map(a => a.name).join(", ") || "Unknown Artist",
            duration: songData.length?.formatted || "Unknown",
            albumCover: songData.coverArt || "https://via.placeholder.com/300?text=No+Cover",
            difficulty: calculateDifficulty(songData),
            genre: songData.genres?.[0] || "Unknown"
          });
        }
      } catch (err) {
        setError("Failed to load song details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSongDetails();
  }, [songId]);

  // Simple algorithm to calculate difficulty (could be more sophisticated)
  const calculateDifficulty = (songData) => {
    // This is a placeholder - in a real app, you might analyze tempo, pitch range, etc.
    const difficultyLevels = ["Easy", "Medium", "Hard"];
    // For demo purposes, just return a random difficulty
    return difficultyLevels[Math.floor(Math.random() * difficultyLevels.length)];
  };

  const handleStartGame = () => {
    navigate(`/game/${songId}`, { state: { song } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FED770]">
        <LoadingSVG size={180} className="mb-8" />
        <div className="text-xl text-gray-700 animate-pulse">Loading song details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FED770]">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/music')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md"
          >
            Back to Music Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FED770] to-[#FEE9B0] py-12 px-4 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center mb-6 text-indigo-800">Challenge Mode</h1>
        
        <div className="flex justify-center mb-8">
          <MusicNoteSVG size={180} />
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 w-full">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <SongDetails song={song} />
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4 text-center">How to Play</h2>
            <ol className="list-decimal pl-6 space-y-3 text-gray-700">
              <li>Each player will take turns singing along with the lyrics</li>
              <li>Follow the highlighted lyrics on screen</li>
              <li>The app will score your performance based on timing and pitch</li>
              <li>After all players have performed, scores will be revealed</li>
            </ol>
          </div>
        </div>
        
        <div className="mt-10 flex justify-center">
          <PlayButton onStart={handleStartGame} />
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
