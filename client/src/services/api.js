const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Check API health
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'error', error: error.message };
  }
};

/**
 * Search for songs
 * @param {string} query - Search term
 * @param {number} limit - Maximum number of results
 * @returns {Promise<Object>} Search results
 */
export const searchSongs = async (query, limit = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/search?query=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Search failed:', error);
    return { error: error.message, results: [] };
  }
};

/**
 * Get song details
 * @param {string} recordingId - MusicBrainz recording ID
 * @returns {Promise<Object>} Song details
 */
export const getSongDetails = async (recordingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/song/${recordingId}`);
    if (!response.ok) {
      throw new Error(`Failed to get song details with status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to get song details:', error);
    return { error: error.message };
  }
};

/**
 * Compare song performance
 * @param {File} originalSong - Original song file
 * @param {File} userPerformance - User's performance file
 * @param {Object} songInfo - Song metadata
 * @returns {Promise<Object>} Comparison results
 */
export const comparePerformance = async (originalSong, userPerformance, songInfo = {}) => {
  try {
    const formData = new FormData();
    formData.append('song', originalSong);
    formData.append('player', userPerformance);
    
    // Add optional metadata
    if (songInfo.id) formData.append('song_id', songInfo.id);
    if (songInfo.title) formData.append('song_title', songInfo.title);
    if (songInfo.artist) formData.append('song_artist', songInfo.artist);
    if (songInfo.plot) formData.append('plot', 'true');
    
    const response = await fetch(`${API_BASE_URL}/compare`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Comparison failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Comparison failed:', error);
    return { error: error.message, score: 0 };
  }
};
