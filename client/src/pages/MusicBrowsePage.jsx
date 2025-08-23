import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { searchSongs } from "../services/api";
import LoadingSVG from "../components/svgs/LoadingSVG";

const MusicBrowsePage = () => {
  const [activeGenre, setActiveGenre] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const searchInputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  
  // Debounced search function
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length >= 2) {
        performSearch(searchTerm);
      } else if (searchTerm.length === 0) {
        // Clear results if search is empty
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);
  
  const performSearch = async (query) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await searchSongs(query);
      if (response.error) {
        setError(response.error);
        setSearchResults([]);
      } else {
        setSearchResults(response.results || []);
      }
    } catch (err) {
      setError("Failed to search songs. Please try again.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter by genre (client-side)
  const filteredTracks = activeGenre === "all" 
    ? searchResults 
    : searchResults.filter(track => {
        // Assuming genre info is available in the releases or we could implement a simple genre classifier
        return track.genres?.includes(activeGenre) || true; // Temporary - remove true when genre data is available
      });
  
  // GSAP Animations
  useGSAP(() => {
    gsap.fromTo(
      ".music-card",
      { y: 20, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        stagger: 0.05,
        ease: "power2.out",
        duration: 0.6,
        delay: 0.1,
      }
    );
  }, [filteredTracks]);

  const handleGenreChange = (genre) => {
    setActiveGenre(genre);
  };

  const focusSearchInput = () => {
    searchInputRef.current.focus();
  };

  const handleSongSelect = (song) => {
    navigate(`/challenge/${song.id}`);
  };

  return (
    <section className="bg-[#faeade] min-h-screen py-32 px-5 md:px-10">
      <div className="container mx-auto" ref={containerRef}>
        <div className="overflow-hidden mb-10">
          <h1 className="browse-title general-title text-center text-dark-brown">Music Library</h1>
        </div>
        
        <div className="search-container flex items-center mb-12 max-w-lg mx-auto">
          <div className="relative w-full">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for songs or artists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-milk/50 backdrop-blur-md border-2 border-yellow-brown/30 rounded-full py-3 px-5 pl-12 text-dark-brown placeholder:text-dark-brown/50 focus:outline-none focus:border-yellow-brown transition-all duration-300"
            />
            <div 
              className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-brown/70 cursor-pointer"
              onClick={focusSearchInput}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="genre-tabs flex flex-wrap justify-center gap-3 md:gap-5 mb-12">
          <GenreTab 
            label="All Genres" 
            isActive={activeGenre === 'all'} 
            onClick={() => handleGenreChange('all')} 
          />
          <GenreTab 
            label="Pop" 
            isActive={activeGenre === 'pop'} 
            onClick={() => handleGenreChange('pop')} 
          />
          <GenreTab 
            label="Rock" 
            isActive={activeGenre === 'rock'} 
            onClick={() => handleGenreChange('rock')} 
          />
          <GenreTab 
            label="Hip Hop" 
            isActive={activeGenre === 'hip-hop'} 
            onClick={() => handleGenreChange('hip-hop')} 
          />
          <GenreTab 
            label="R&B" 
            isActive={activeGenre === 'r&b'} 
            onClick={() => handleGenreChange('r&b')} 
          />
          <GenreTab 
            label="K-Pop" 
            isActive={activeGenre === 'k-pop'} 
            onClick={() => handleGenreChange('k-pop')} 
          />
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSVG size={100} className="mb-6" />
            <p className="text-dark-brown">Searching for songs...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <h3 className="text-red-600 text-xl">{error}</h3>
            <p className="text-dark-brown/70 mt-2">Please try again or check your connection</p>
          </div>
        ) : searchTerm.length < 2 && searchResults.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-dark-brown text-xl">Start typing to search for songs</h3>
            <p className="text-dark-brown/70 mt-2">Enter at least 2 characters</p>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {filteredTracks.map((track, index) => (
              <MusicCard 
                key={track.id || index} 
                track={track} 
                onSelect={() => handleSongSelect(track)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-dark-brown text-xl">No songs found</h3>
            <p className="text-dark-brown/70 mt-2">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </section>
  );
};

// Genre tab component
const GenreTab = ({ label, isActive, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`px-5 py-2 rounded-full font-paragraph transition-all duration-300 ${
        isActive 
          ? 'bg-yellow-brown text-milk' 
          : 'bg-dark-brown/10 text-dark-brown hover:bg-dark-brown/20'
      }`}
    >
      {label}
    </button>
  );
};

// Music card component
const MusicCard = ({ track, onSelect }) => {
  // Format artist names
  const artistNames = track.artists ? track.artists.map(a => a.name).join(", ") : "Unknown Artist";
  
  // Get cover art if available
  const coverArt = track.releases && track.releases[0]?.coverArt 
    ? track.releases[0].coverArt 
    : "https://via.placeholder.com/300?text=No+Cover";
  
  // Calculate difficulty (could be more sophisticated)
  const difficulty = "Medium"; // Placeholder
  
  return (
    <div 
      className="music-card bg-milk/80 shadow-md backdrop-blur-md rounded-xl overflow-hidden hover:shadow-lg hover:shadow-yellow-brown/20 transition-all duration-300 cursor-pointer"
      onClick={onSelect}
    >
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={coverArt} 
          alt={track.title} 
          className="card-image w-full h-full object-cover transition-all duration-300"
        />
        <div className="play-button opacity-0 scale-90 absolute inset-0 flex items-center justify-center bg-black/50 transition-all duration-300 group-hover:opacity-100 group-hover:scale-100">
          <div className="w-16 h-16 rounded-full bg-yellow-brown flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="text-milk" viewBox="0 0 16 16">
              <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"/>
            </svg>
          </div>
        </div>
        <div className="absolute top-3 right-3 bg-yellow-brown text-milk px-2 py-1 text-xs font-bold rounded">
          {difficulty}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-dark-brown font-medium text-lg truncate">{track.title || "Untitled"}</h3>
        <p className="text-dark-brown/70 text-sm">{artistNames}</p>
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="text-yellow-brown" viewBox="0 0 16 16">
              <path d="M8 0a1 1 0 0 1 1 1v5.268l4.562-2.634a1 1 0 1 1 1 1.732L10 8l4.562 2.634a1 1 0 1 1-1 1.732L9 9.732V15a1 1 0 1 1-2 0V9.732l-4.562 2.634a1 1 0 1 1-1-1.732L6 8 1.438 5.366a1 1 0 0 1 1-1.732L7 6.268V1a1 1 0 0 1 1-1z"/>
            </svg>
            <span className="text-dark-brown text-xs font-medium">
              {track.length?.formatted || "Unknown"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicBrowsePage;
