from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import tempfile
import os
import matplotlib.pyplot as plt
import numpy as np
from io import BytesIO
import base64
import time
from pathlib import Path
from typing import Optional, List, Dict, Any
from music.search import search_song, get_song_details
from score.score import compute_pitch_accuracy

# Create FastAPI app
app = FastAPI(
    title="Music Box API",
    description="Backend API for Music Box karaoke application",
    version="1.0.0",
)

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define a function to get song path for dependency injection
async def get_pitch_accuracy(
    song: UploadFile = File(...), 
    player: UploadFile = File(...), 
    plot: Optional[str] = Form(None),
    song_id: Optional[str] = Form(None),
    song_title: Optional[str] = Form(None),
    song_artist: Optional[str] = Form(None),
):
    # Save temp files
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as f1:
        f1.write(await song.read())
        song_path = f1.name
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as f2:
        f2.write(await player.read())
        player_path = f2.name

    # Compute accuracy
    show_plot = plot is not None
    score, img_base64 = compute_pitch_accuracy(song_path, player_path, plot=show_plot)

    # Cleanup
    os.remove(song_path)
    os.remove(player_path)
    
    return {
        "score": float(score),
        "img_base64": img_base64,
        "song_id": song_id,
        "song_title": song_title,
        "song_artist": song_artist,
    }

# ---- API Routes ----
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": time.time()}

@app.get("/api/search")
async def search_api(query: str, limit: int = 10):
    """
    Search for songs by query
    
    - **query**: Search term for songs/artists
    - **limit**: Maximum number of results (default: 10)
    """
    results = search_song(query, limit)
    
    if "error" in results:
        raise HTTPException(status_code=500, detail=results["error"])
    
    # Process results for API
    processed_results = []
    for song in results["results"]:
        artists = [{"id": artist["id"], "name": artist["name"]} for artist in song["artists"]]
        length_sec = song["length"] / 1000 if song["length"] else 0
        length_min = int(length_sec // 60)
        length_sec = int(length_sec % 60)
        
        processed_results.append({
            "id": song["id"],
            "title": song["title"],
            "artists": artists,
            "length": {
                "milliseconds": song["length"],
                "formatted": f"{length_min}:{length_sec:02d}"
            },
            "releases": song["releases"]
        })
    
    return {
        "query": query,
        "count": results["count"],
        "results": processed_results
    }

@app.get("/api/song/{recording_id}")
async def song_details_api(recording_id: str):
    """
    Get detailed information about a specific song
    
    - **recording_id**: MusicBrainz recording ID
    """
    details = get_song_details(recording_id)
    
    if "error" in details:
        raise HTTPException(status_code=500, detail=details["error"])
    
    return {"song": details["details"]}

@app.post("/api/compare")
async def compare_api(result_data: dict = Depends(get_pitch_accuracy)):
    """
    Compare original song with user performance
    
    Form data:
    - **song**: Original song file (WAV)
    - **player**: User performance file (WAV)
    - **plot**: Include visualization (optional)
    - **song_id**: Song ID (optional)
    - **song_title**: Song title (optional)
    - **song_artist**: Song artist (optional)
    """
    return {
        "score": result_data["score"],
        "visualization": result_data["img_base64"],
        "song": {
            "id": result_data["song_id"],
            "title": result_data["song_title"],
            "artist": result_data["song_artist"],
        }
    }

# Run server
if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
