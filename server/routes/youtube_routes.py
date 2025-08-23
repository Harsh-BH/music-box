from flask import Blueprint, request, jsonify
from music.song_download import YouTubeHandler

youtube_bp = Blueprint('youtube', __name__)
youtube_handler = YouTubeHandler()

@youtube_bp.route('/search', methods=['GET'])
def search_youtube():
    """Search for videos on YouTube"""
    query = request.args.get('query', '')
    limit = request.args.get('limit', 5, type=int)
    
    if not query:
        return jsonify({'error': 'Query parameter is required'}), 400
    
    results = youtube_handler.search_youtube(query, limit)
    return jsonify(results)

@youtube_bp.route('/stream-info/<video_id>', methods=['GET'])
def get_stream_info(video_id):
    """Get information needed for streaming a YouTube video"""
    info = youtube_handler.get_stream_info(video_id)
    
    if 'error' in info:
        return jsonify(info), 400
        
    return jsonify(info)

@youtube_bp.route('/download/<video_id>', methods=['POST'])
def download_youtube_audio(video_id):
    """Download audio from a YouTube video"""
    data = request.get_json() or {}
    filename = data.get('filename')
    
    result = youtube_handler.download_audio(video_id, filename)
    
    if 'error' in result:
        return jsonify(result), 400
        
    return jsonify(result)
