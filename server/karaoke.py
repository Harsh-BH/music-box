from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import uvicorn
import tempfile
import os
import matplotlib.pyplot as plt
import numpy as np
from io import BytesIO
import base64
import librosa
import functools
import hashlib
import time

app = FastAPI()

# ---- Your pitch accuracy function (placeholder) ----
def compute_pitch_accuracy(original_song, player_song, plot=False):
    # Dummy example (replace with your actual logic)
    score = np.random.uniform(0, 100)  # random similarity for demo

    times = np.linspace(0, 5, 100)
    orig = np.sin(times)
    player = np.sin(times + 0.5)

    if plot:
        fig, ax = plt.subplots()
        ax.plot(times, orig, label="Original")
        ax.plot(times, player, label="Player")
        ax.legend()
        ax.set_title("Pitch Alignment")
        buf = BytesIO()
        plt.savefig(buf, format="png")
        plt.close(fig)
        buf.seek(0)
        img_base64 = base64.b64encode(buf.read()).decode("utf-8")
        return score, img_base64
    return score, None

# ---- Upload Form (Homepage) ----
@app.get("/", response_class=HTMLResponse)
async def home():
    return """
    <html>
        <head>
            <title>Karaoke Pitch Comparison</title>
        </head>
        <body style="font-family: sans-serif;">
            <h2>🎤 Upload Your Song and Recording</h2>
            <form action="/compare/" enctype="multipart/form-data" method="post">
                <label>Original Song:</label><br>
                <input type="file" name="song"><br><br>
                <label>Your Singing:</label><br>
                <input type="file" name="player"><br><br>
                <label>Show Plot:</label>
                <input type="checkbox" name="plot"><br><br>
                <input type="submit" value="Compare">
            </form>
        </body>
    </html>
    """

# ---- Compare Route ----
@app.post("/compare/", response_class=HTMLResponse)
async def compare(song: UploadFile = File(...), player: UploadFile = File(...), plot: str = Form(None)):
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

    # Build HTML response
    html = f"""
    <html>
        <head><title>Results</title></head>
        <body style="font-family: sans-serif;">
            <h2>✅ Pitch Alignment Results</h2>
            <p><b>Score:</b> {score:.2f}%</p>
    """
    if img_base64:
        html += f'<img src="data:image/png;base64,{img_base64}" alt="Pitch Plot"/>'
    html += """
            <br><br>
            <a href="/">⬅️ Try Again</a>
        </body>
    </html>
    """
    return HTMLResponse(content=html)

if __name__ == "__main__":
    uvicorn.run("karaoke:app", host="127.0.0.1", port=8000, reload=True)
