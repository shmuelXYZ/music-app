const axios = require('axios');
const { logger } = require('../utils/logger');

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const API_KEY = process.env.YOU_TUBE_API_KEY;

/**
 * Search for videos on YouTube with pagination
 * @param {string} query - Search query
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of items per page (max 50)
 * @param {string} pageToken - Page token for pagination
 * @returns {Object} Search results with pagination info
 */
async function searchVideos(query, page = 1, limit = 6, pageToken = null) {
  try {
    if (!API_KEY) {
      throw {
        message: 'YouTube API key not configured',
        status: 500
      };
    }

    // YouTube API parameters
    const params = {
      key: API_KEY,
      part: 'snippet',
      q: query,
      type: 'video',
      videoCategoryId: '10', // Music category
      maxResults: Math.min(limit, 50), // YouTube API max is 50
      order: 'relevance'
    };

    // Add page token for pagination (YouTube uses tokens instead of offset)
    if (pageToken) {
      params.pageToken = pageToken;
    }

    logger.info(`Making YouTube API request with params:`, params);

    const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params,
      timeout: 10000 // 10 second timeout
    });

    const data = response.data;
    
    // Process the results
    const videos = data.items || [];
    const nextPageToken = data.nextPageToken;
    const prevPageToken = data.prevPageToken;
    const totalResults = data.pageInfo?.totalResults || 0;
    
    // Transform YouTube video data to match our frontend expectations
    const transformedVideos = videos.map(video => ({
      id: video.id.videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      artwork_url: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.default?.url,
      permalink_url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
      user: {
        id: video.snippet.channelId,
        username: video.snippet.channelTitle,
        avatar_url: null // YouTube search API doesn't provide channel avatar
      },
      created_at: video.snippet.publishedAt,
      duration: null, // YouTube search API doesn't provide duration
      playback_count: null, // Would need separate API call
      likes_count: null, // Would need separate API call
      tag_list: video.snippet.tags ? video.snippet.tags.join(' ') : '',
      // Additional YouTube-specific fields
      video_url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
      embed_url: `https://www.youtube.com/embed/${video.id.videoId}`,
      channel: {
        name: video.snippet.channelTitle,
        id: video.snippet.channelId
      },
      published_at: video.snippet.publishedAt
    }));

    const result = {
      success: true,
      data: {
        tracks: transformedVideos, // Keep 'tracks' for backward compatibility
        videos: transformedVideos,
        pagination: {
          current_page: page,
          limit: limit,
          total_items: Math.min(totalResults, 1000), // YouTube API limits results
          has_next: !!nextPageToken,
          has_previous: !!prevPageToken,
          next_page_token: nextPageToken,
          prev_page_token: prevPageToken
        }
      },
      // Additional fields for backward compatibility with frontend
      tracks: transformedVideos,
      hasNext: !!nextPageToken,
      nextHref: nextPageToken,
      totalResults: Math.min(totalResults, 1000),
      message: transformedVideos.length > 0 
        ? `Found ${transformedVideos.length} videos for "${query}"` 
        : `No videos found for "${query}"`
    };

    logger.info(`YouTube search completed: ${transformedVideos.length} videos found`);
    return result;

  } catch (error) {
    logger.error('YouTube API error:', error.response?.data || error.message);
    
    if (error.response) {
      const { status, data } = error.response;
      
      // Handle specific YouTube API errors
      if (status === 400) {
        throw {
          message: data.error?.message || 'Invalid request parameters',
          status: 400
        };
      } else if (status === 403) {
        if (data.error?.message?.includes('quota')) {
          throw {
            message: 'YouTube API quota exceeded. Please try again later.',
            status: 429
          };
        } else {
          throw {
            message: 'YouTube API access forbidden. Please check your API key.',
            status: 401
          };
        }
      } else if (status === 404) {
        throw {
          message: 'No videos found',
          status: 404
        };
      }
    }

    // Network or other errors
    if (error.code === 'ECONNABORTED') {
      throw {
        message: 'Request timeout. Please try again.',
        status: 408
      };
    }

    throw {
      message: error.message || 'Failed to search YouTube videos',
      status: 500
    };
  }
}

/**
 * Get next page of results using page token
 * @param {string} nextPageToken - Page token from previous response
 * @param {string} originalQuery - The original search query
 * @param {number} limit - Number of items per page
 * @returns {Object} Next page results
 */
async function getNextPage(nextPageToken, originalQuery = '', limit = 6) {
  try {
    if (!nextPageToken) {
      throw {
        message: 'Page token is required',
        status: 400
      };
    }

    // For simplicity, we'll use the searchVideos function with the page token
    // In a real implementation, you might want to store the original query
    const result = await searchVideos(originalQuery, 1, limit, nextPageToken);
    
    return result;

  } catch (error) {
    logger.error('Get next page error:', error);
    throw error;
  }
}

module.exports = {
  searchVideos,
  getNextPage,
  // Keep old function names for backward compatibility
  searchTracks: searchVideos
};
