import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import LyricsDisplay from '../components/challenge/LyricsDisplay';
import UserTurn from '../components/challenge/UserTurn';
import MicrophoneSVG from '../components/svgs/MicrophoneSVG';
import LoadingSVG from '../components/svgs/LoadingSVG';
import WaveSVG from '../components/svgs/WaveSVG';
import { getSongDetails, comparePerformance } from '../services/api';

const GamePage = () => {
  const { songId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [song, setSong] = useState(location.state?.song || null);
  const [loading, setLoading] = useState(!location.state?.song);
  const [error, setError] = useState(null);
  
  const [currentUser, setCurrentUser] = useState(1);
  const [totalUsers, setTotalUsers] = useState(2); // Default 2 players
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [scores, setScores] = useState({});
  const [lyrics, setLyrics] = useState([]);
  
  // References for audio and recording
  const audioRef = useRef(null);
  const recordingRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  
  // Fetch song details if not provided in location state
  useEffect(() => {
    if (!song && songId) {
      const fetchSongDetails = async () => {
        try {
          const response = await getSongDetails(songId);
          if (response.error) {
            setError(response.error);
          } else {
            // Transform API response to match our component's expected format
            const songData = response.song;
            
            setSong({
              id: songId,
              title: songData.title || "Unknown Title",
              artist: songData.artists?.map(a => a.name).join(", ") || "Unknown Artist",
              duration: songData.length?.formatted || "Unknown",
              albumCover: songData.coverArt || "https://via.placeholder.com/300?text=No+Cover",
              difficulty: "Medium", // Placeholder
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
    }
  }, [songId, song]);
  
  // Set up lyrics once song is loaded
  useEffect(() => {
    if (song) {
      // In a real app, you would fetch lyrics from an API
      // For now, we'll use placeholder lyrics
      setLyrics([
        { time: 0, text: "When I find myself in times of trouble" },
        { time: 5, text: "Mother Mary comes to me" },
        { time: 10, text: "Speaking words of wisdom, let it be" },
        { time: 15, text: "And in my hour of darkness" },
        { time: 20, text: "She is standing right in front of me" },
        { time: 25, text: "Speaking words of wisdom, let it be" },
      ]);
      
      // Load audio file - in a real app, this would be from the API
      audioRef.current = new Audio('/sample-song.mp3');
      
      setLoading(false);
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      // Stop recording if it's in progress
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [song]);

  useEffect(() => {
    if (gameStarted && audioRef.current) {
      const interval = setInterval(() => {
        setCurrentTime(audioRef.current.currentTime);
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [gameStarted]);

  // Start recording and playing the song
  const startUserTurn = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      // Handle recorded data
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      // Handle recording stop
      mediaRecorderRef.current.onstop = () => {
        // Create a blob from the audio chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Create a URL for the blob
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Set the recording ref
        recordingRef.current = { blob: audioBlob, url: audioUrl };
        
        // Reset chunks for next recording
        audioChunksRef.current = [];
        
        // Generate a score - in a real app, this would use the compare API
        // For now, we'll simulate it
        simulateScoreCalculation();
      };
      
      // Start recording
      mediaRecorderRef.current.start();
      
      // Start playing the song
      audioRef.current.play();
      
      // Update game state
      setGameStarted(true);
      
      // Update timer to track progress
      audioRef.current.addEventListener('ended', handleSongEnd);
    } catch (err) {
      console.error('Failed to start recording:', err);
      alert('Failed to access microphone. Please check your permissions and try again.');
    }
  };
  
  // Simulate score calculation (in a real app, this would use the compare API)
  const simulateScoreCalculation = async () => {
    // In a real app, you would call the compare API here
    /*
    if (recordingRef.current && audioRef.current) {
      try {
        const originalSong = await fetch(audioRef.current.src).then(r => r.blob());
        const result = await comparePerformance(
          originalSong,
          recordingRef.current.blob,
          {
            id: song.id,
            title: song.title,
            artist: song.artist,
            plot: true
          }
        );
        
        if (result.error) {
          console.error('Scoring error:', result.error);
          // Fall back to random score
          return Math.floor(Math.random() * 50) + 50;
        }
        
        return result.score;
      } catch (err) {
        console.error('Failed to compare performance:', err);
        // Fall back to random score
        return Math.floor(Math.random() * 50) + 50;
      }
    }
    */
    
    // For demo purposes, return a random score
    return Math.floor(Math.random() * 50) + 50;
  };
  
  const handleSongEnd = async () => {
    // Stop recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Generate a score for demo purposes
    const userScore = await simulateScoreCalculation();
    setScores(prev => ({...prev, [currentUser]: userScore}));
    
    if (currentUser < totalUsers) {
      // Move to next user
      setCurrentUser(prev => prev + 1);
      setGameStarted(false);
      audioRef.current.currentTime = 0;
    } else {
      // All users have finished
      setGameFinished(true);
      setTimeout(() => {
        navigate(`/score/${songId}`, { state: { scores, song } });
      }, 2000);
    }
  };

  const getCurrentLyric = () => {
    if (!lyrics.length) return "";
    
    // Find the lyric that matches the current time
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        return lyrics[i].text;
      }
    }
    return lyrics[0].text;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#FED770] to-[#FEE9B0]">
        <LoadingSVG size={150} className="mb-8" />
        <div className="text-xl text-gray-700 animate-pulse">Loading game...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#FED770] to-[#FEE9B0]">
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
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl font-bold text-center mb-6 text-indigo-800">Karaoke Challenge</h1>
        
        <div className="flex justify-center mb-8">
          {gameStarted ? (
            <WaveSVG size={150} />
          ) : (
            <MicrophoneSVG size={120} isActive={gameStarted} />
          )}
        </div>
        
        {!gameStarted && !gameFinished ? (
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
            <UserTurn 
              user={currentUser} 
              onStart={startUserTurn}
            />
          </div>
        ) : gameFinished ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center flex flex-col items-center">
            <LoadingSVG size={120} className="mx-auto mb-4" />
            <p className="text-2xl text-gray-600">Calculating final scores...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center w-full">
            <div className="bg-indigo-100 text-indigo-800 py-2 px-4 rounded-lg mb-6 inline-block font-semibold">
              Player {currentUser}'s Turn
            </div>
            
            <LyricsDisplay 
              currentLyric={getCurrentLyric()} 
              nextLyric={lyrics.find(l => l.time > currentTime)?.text || ""}
            />
            
            <div className="h-2 bg-gray-200 rounded-full mt-8 overflow-hidden w-full">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${(currentTime / (audioRef.current?.duration || 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;
