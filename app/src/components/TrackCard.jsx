import React from 'react';

const TrackCard = ({ track }) => {
  const formatDuration = (milliseconds) => {
    if (!milliseconds) return 'Unknown';
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handlePlay = () => {
    if (track.permalink_url || track.video_url) {
      window.open(track.permalink_url || track.video_url, '_blank');
    }
  };

  return (
    <div className="card group">
      {/* Artwork */}
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img
          src={track.artwork_url || '/api/placeholder/300/300'}
          alt={track.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = '/api/placeholder/300/300';
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={handlePlay}
            className="opacity-0 group-hover:opacity-100 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 transition-all duration-300 transform scale-90 group-hover:scale-100"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Track Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-orange-600 transition-colors">
          {track.title}
        </h3>
        
        <p className="text-sm text-gray-600 line-clamp-1">
          by {track.user?.username || track.channel?.name || 'Unknown Channel'}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {formatNumber(track.likes_count || 0)}
          </span>
          
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 18v-6a9 9 0 0118 0v6a9 9 0 01-18 0zm3-6v6a6 6 0 0012 0v-6a6 6 0 00-12 0z"/>
            </svg>
            {formatNumber(track.playback_count || 0)}
          </span>
          
          {track.duration && (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              {formatDuration(track.duration)}
            </span>
          )}
        </div>

        {track.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mt-2">
            {track.description}
          </p>
        )}

        {/* Tags */}
        {track.tag_list && (
          <div className="flex flex-wrap gap-1 mt-2">
            {track.tag_list.split(' ').slice(0, 3).map((tag, index) => (
              tag && (
                <span
                  key={index}
                  className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded"
                >
                  #{tag.replace(/"/g, '')}
                </span>
              )
            ))}
          </div>
        )}

        {/* Created Date */}
        {(track.created_at || track.published_at) && (
          <p className="text-xs text-gray-400 mt-2">
            {new Date(track.created_at || track.published_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
};

export default TrackCard;
