import requests
from bs4 import BeautifulSoup
import re
from ddgs import DDGS
from pathlib import Path


def fetch_lyrics_from_url(url: str) -> str:
    """Fetch lyrics from Genius, AZLyrics, or Lyrics.com (only main lyrics)."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                      "AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/115.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Referer": "https://www.google.com/"
    }

    try:
        page = requests.get(url, headers=headers, timeout=15)
        page.raise_for_status()
        soup = BeautifulSoup(page.text, "html.parser")
    except Exception as e:
        print(f"⚠️ Error fetching {url}: {e}")
        return ""

    lyrics = ""

    if "genius.com" in url:
        # Only grab divs that contain actual lyrics
        divs = soup.find_all("div", {"data-lyrics-container": "true"})
        lyrics = "\n".join([div.get_text(separator="\n").strip() for div in divs])

    elif "azlyrics.com" in url:
        # Lyrics are usually in the first div with no class/id after comments
        divs = soup.find_all("div", class_=None, id=None)
        if len(divs) > 1:
            lyrics = divs[1].get_text("\n").strip()

    elif "lyrics.com" in url:
        pre = soup.find("pre", id="lyric-body-text")
        if pre:
            lyrics = pre.get_text("\n").strip()

    if "Read More" in lyrics:
        lyrics = lyrics.split("Read More", 1)[1].strip()

    # Clean up extra newlines and bracketed sections like [Chorus]
    lyrics = re.sub(r"\[.*?\]", "", lyrics)
    lyrics = re.sub(r"\n{2,}", "\n", lyrics).strip()

    return lyrics


def search_lyrics(song_name: str, artist_name: str = None, max_results=5) -> str:
    """Search DuckDuckGo for lyrics sites and try multiple sources"""
    query = f"{song_name} lyrics"
    if artist_name:
        query = f"{artist_name} {song_name} lyrics"

    results = list(DDGS().text(query, max_results=max_results))

    for r in results:
        url = r.get("href") or r.get("link")
        if not url:
            continue
        if any(site in url for site in ["genius.com", "azlyrics.com", "lyrics.com"]):
            print(f"🔎 Trying: {url}")
            lyrics = fetch_lyrics_from_url(url)
            if lyrics:
                return lyrics

    return "❌ No lyrics found."


def save_lyrics(song_name: str, lyrics: str):
    """Save lyrics to the pre-existing lyrics folder"""
    save_folder = "/home/shriya/github_repos/music-box/server/music/lyrics"  # your folder
    Path(save_folder).mkdir(parents=True, exist_ok=True)
    safe_name = re.sub(r'[\\/*?:"<>|]', "", song_name)  # remove illegal filename chars
    filepath = Path(save_folder) / f"{safe_name}.txt"

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(lyrics)

    print(f"\n✅ Lyrics saved to {filepath}")


if __name__ == "__main__":
    song = "Love Story"
    artist = "Taylor Swift"

    lyrics = search_lyrics(song, artist)

    print("🎵 Lyrics:\n")
    print(lyrics if lyrics else "❌ Failed to extract lyrics.")

    if lyrics and lyrics != "❌ No lyrics found.":
        save_lyrics(song, lyrics)
