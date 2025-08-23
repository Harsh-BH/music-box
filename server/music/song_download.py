import os
import re
import json
import requests
from typing import Dict, List, Optional, Any
import yt_dlp  # More reliable than pytube

class YouTubeHandler:
    """
    Handler for YouTube operations including searching, streaming, and downloading songs.
    """
    
    def __init__(self, download_dir: str = "downloads"):
        """Initialize with download directory."""
        self.download_dir = download_dir
        os.makedirs(download_dir, exist_ok=True)
    
    def search_youtube(self, query: str, limit: int = 5) -> List[Dict]:
        """
        Search YouTube for videos matching the query using yt-dlp.
        
        Args:
            query: Search terms
            limit: Maximum number of results to return
            
        Returns:
            List of video information dictionaries
        """
        results = []
        
        try:
            # Use yt-dlp's built-in search functionality
            ydl_opts = {
                'quiet': True,
                'extract_flat': True,
                'force_generic_extractor': True,
                'default_search': 'ytsearch',
                'ignoreerrors': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                search_results = ydl.extract_info(f'ytsearch{limit}:{query}', download=False)
                
                if 'entries' in search_results:
                    for entry in search_results['entries']:
                        if entry:
                            # Extract only needed information
                            results.append({
                                'id': entry.get('id'),
                                'title': entry.get('title'),
                                'author': entry.get('uploader'),
                                'length': entry.get('duration'),
                                'thumbnail': entry.get('thumbnail'),
                                'url': entry.get('webpage_url') or f"https://www.youtube.com/watch?v={entry.get('id')}"
                            })
        
        except Exception as e:
            print(f"Search error: {str(e)}")
            # Fallback - attempt using simple HTTP request if yt-dlp fails
            try:
                search_url = f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}"
                response = requests.get(search_url)
                
                # Extract video IDs from response
                video_ids = re.findall(r"watch\?v=(\S{11})", response.text)[:limit]
                
                # For each ID, get basic info
                for video_id in video_ids:
                    results.append({
                        'id': video_id,
                        'title': f"Video {video_id}",  # Limited info in fallback
                        'author': "Unknown",
                        'thumbnail': f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg",
                        'url': f"https://www.youtube.com/watch?v={video_id}"
                    })
            except Exception as fallback_error:
                print(f"Fallback search error: {str(fallback_error)}")
        
        return results
    
    def get_stream_info(self, video_id: str) -> Dict:
        """
        Get information needed for streaming a video with the IFrame Player API.
        
        Args:
            video_id: YouTube video ID
            
        Returns:
            Dictionary with video metadata for streaming
        """
        try:
            ydl_opts = {
                'quiet': True,
                'skip_download': True,
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
                
                return {
                    'id': video_id,
                    'title': info.get('title', ''),
                    'author': info.get('uploader', ''),
                    'embed_url': f"https://www.youtube.com/embed/{video_id}",
                    'iframe_html': f'<iframe width="560" height="315" src="https://www.youtube.com/embed/{video_id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
                    'duration': info.get('duration'),
                    'view_count': info.get('view_count')
                }
        except Exception as e:
            print(f"Stream info error: {str(e)}")
            # Return basic info on error
            return {
                'id': video_id,
                'title': f"Video {video_id}",
                'embed_url': f"https://www.youtube.com/embed/{video_id}",
                'iframe_html': f'<iframe width="560" height="315" src="https://www.youtube.com/embed/{video_id}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
                'error': str(e)
            }
    
    def download_audio(self, video_id: str, filename: Optional[str] = None) -> Dict:
        """
        Download audio from a YouTube video using yt-dlp.
        
        Args:
            video_id: YouTube video ID
            filename: Optional custom filename (without extension)
            
        Returns:
            Dictionary with download information
        """
        url = f"https://www.youtube.com/watch?v={video_id}"
        
        try:
            # If filename is not provided, it will be generated from the video title
            output_template = os.path.join(self.download_dir, filename or '%(title)s')
            
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': output_template,
                'postprocessors': [{
                    'key': 'FFmpegExtractAudio',
                    'preferredcodec': 'mp3',
                    'preferredquality': '192',
                }],
                'quiet': False,
                'verbose': True,
            }
            
            # Download the audio
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=True)
                
                # Get the downloaded file path
                if filename:
                    output_file = f"{output_template}.mp3"
                else:
                    output_file = ydl.prepare_filename(info).replace(
                        os.path.splitext(ydl.prepare_filename(info))[1], '.mp3'
                    )
                
                return {
                    'success': True,
                    'video_id': video_id,
                    'title': info.get('title', ''),
                    'file_path': output_file,
                    'file_name': os.path.basename(output_file),
                    'file_size': os.path.getsize(output_file) if os.path.exists(output_file) else 0
                }
                
        except Exception as e:
            print(f"Download error: {str(e)}")
            return {'error': str(e)}


# Example usage
if __name__ == "__main__":
    handler = YouTubeHandler()
    
    # Search example
    print("Searching for videos...")
    results = handler.search_youtube("Coldplay Viva La Vida")
    print(f"Found {len(results)} videos")
    
    if results:
        # Get the first result
        video_id = results[0]['id']
        print(f"Selected video ID: {video_id}")
        
        # Get streaming info
        stream_info = handler.get_stream_info(video_id)
        print(f"Stream info: {stream_info}")
        
        # Download the audio
        print("Downloading audio...")
        download_info = handler.download_audio(video_id)
        print(f"Download info: {download_info}")
