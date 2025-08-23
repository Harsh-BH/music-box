import requests
import time

# MusicBrainz API base URL
MUSICBRAINZ_API_URL = "https://musicbrainz.org/ws/2"
# Set a proper user agent as required by MusicBrainz API
USER_AGENT = "MusicBox/1.0 (github.com/music-box)"

def search_song(query, limit=10):
    """
    Search for a song using MusicBrainz API
    
    Args:
        query (str): The search query
        limit (int): Maximum number of results to return
        
    Returns:
        dict: Search results including recordings, artists, and release info
    """
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json"
    }
    
    params = {
        "query": query,
        "limit": limit,
        "fmt": "json"
    }
    
    try:
        # Search for recordings (songs)
        response = requests.get(
            f"{MUSICBRAINZ_API_URL}/recording/", 
            headers=headers,
            params=params
        )
        response.raise_for_status()
        
        # Rate limiting - MusicBrainz allows 1 request per second
        time.sleep(1)
        
        return process_search_results(response.json())
    except requests.exceptions.RequestException as e:
        return {"error": str(e), "results": []}

def get_song_details(recording_id):
    """
    Get detailed information about a specific song
    
    Args:
        recording_id (str): MusicBrainz recording ID
        
    Returns:
        dict: Detailed information about the song
    """
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/json"
    }
    
    params = {
        "inc": "artists+releases+url-rels+isrcs",
        "fmt": "json"
    }
    
    try:
        response = requests.get(
            f"{MUSICBRAINZ_API_URL}/recording/{recording_id}", 
            headers=headers,
            params=params
        )
        response.raise_for_status()
        
        # Rate limiting
        time.sleep(1)
        
        return process_song_details(response.json())
    except requests.exceptions.RequestException as e:
        return {"error": str(e), "details": {}}

def process_search_results(data):
    """
    Process and format the search results
    
    Args:
        data (dict): Raw API response
        
    Returns:
        dict: Formatted search results
    """
    results = []
    
    for recording in data.get("recordings", []):
        song_info = {
            "id": recording.get("id"),
            "title": recording.get("title"),
            "length": recording.get("length"),
            "artists": [{"id": artist.get("id"), "name": artist.get("name")} 
                       for artist in recording.get("artist-credit", []) 
                       if isinstance(artist, dict)],
            "releases": []
        }
        
        # Extract release information
        for release in recording.get("releases", []):
            release_info = {
                "id": release.get("id"),
                "title": release.get("title"),
                "date": release.get("date")
            }
            song_info["releases"].append(release_info)
        
        results.append(song_info)
    
    return {"count": data.get("count", 0), "results": results}

def process_song_details(data):
    """
    Process and format the detailed song information
    
    Args:
        data (dict): Raw API response
        
    Returns:
        dict: Formatted song details
    """
    details = {
        "id": data.get("id"),
        "title": data.get("title"),
        "length": data.get("length"),
        "artists": [],
        "releases": [],
        "isrcs": data.get("isrcs", []),
        "relations": []
    }
    
    # Extract artist information
    for artist_credit in data.get("artist-credit", []):
        if isinstance(artist_credit, dict):
            artist = {
                "id": artist_credit.get("artist", {}).get("id"),
                "name": artist_credit.get("artist", {}).get("name"),
                "disambiguation": artist_credit.get("artist", {}).get("disambiguation", "")
            }
            details["artists"].append(artist)
    
    # Extract release information
    for release in data.get("releases", []):
        release_info = {
            "id": release.get("id"),
            "title": release.get("title"),
            "date": release.get("date"),
            "country": release.get("country"),
            "status": release.get("status"),
            "tracks": []
        }
        
        # Extract media and track information if available
        for medium in release.get("media", []):
            for track in medium.get("tracks", []):
                if track.get("id") == data.get("id"):
                    track_info = {
                        "position": track.get("position"),
                        "number": track.get("number"),
                        "medium": medium.get("position")
                    }
                    release_info["tracks"].append(track_info)
        
        details["releases"].append(release_info)
    
    # Extract relationships/links
    for relation in data.get("relations", []):
        rel_info = {
            "type": relation.get("type"),
            "type-id": relation.get("type-id")
        }
        
        if "url" in relation:
            rel_info["url"] = relation.get("url", {}).get("resource")
            rel_info["title"] = relation.get("url", {}).get("title")
        
        details["relations"].append(rel_info)
    
    return {"details": details}
