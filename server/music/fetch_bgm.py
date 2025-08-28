import subprocess
import os

# Input song path
input_song = "/home/shriya/github_repos/music-box/server/music/downloads/Coldplay - Viva La Vida (Official Video).mp3"

# Output folder
output_dir = "karaoke_output"

# Run Demucs separation
subprocess.run([
    "demucs",
    "--two-stems", "vocals",   
    "--out", output_dir,
    input_song
])

# After this, you’ll find "no_vocals.wav" in the output folder (the karaoke version)
print("✅ Karaoke version created! Check the output folder.")
