const axios = require('axios');
const { logger } = require('../utils/logger');

const SOUNDCLOUD_API_BASE = 'https://api.soundcloud.com';
const CLIENT_ID = process.env.SOUNDCLOUD_CLIENT_ID;

/**
 * Search for tracks on SoundCloud with pagination
 * @param {string} query - Search query
 * @param {number} page - Page number (1-based)
 * @param {number} limit - Number of items per page
 * @returns {Object} Search results with pagination info
 */
async function searchTracks(query, page = 1, limit = 6) {
  try {
    if (!CLIENT_ID) {
      throw {
        message: 'SoundCloud Client ID not configured',
        status: 500
      };
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    const params = {
      client_id: CLIENT_ID,
      q: query,
      limit: limit,
      offset: offset,
      linked_partitioning: 1 // Enable pagination
    };

    logger.info(`Making SoundCloud API request with params:`, params);

    const response = await axios.get(`${SOUNDCLOUD_API_BASE}/tracks`, {
      params,
      timeout: 10000 // 10 second timeout
    });

    const data = response.data;
    
    // Process the results
    const tracks = data.collection || [];
    const nextHref = data.next_href;
    
    // Calculate pagination info
    const totalCount = tracks.length; // Note: SoundCloud doesn't provide total count
    const hasNext = !!nextHref;
    const hasPrevious = page > 1;

    const result = {
      success: true,
      data: {
        tracks: tracks.map(track => ({
          id: track.id,
          title: track.title,
          description: track.description,
          duration: track.duration,
          artwork_url: track.artwork_url,
          permalink_url: track.permalink_url,
          stream_url: track.stream_url,
          user: {
            id: track.user?.id,
            username: track.user?.username,
            avatar_url: track.user?.avatar_url
          },
          created_at: track.created_at,
          genre: track.genre,
          tag_list: track.tag_list
        })),
        pagination: {
          current_page: page,
          limit: limit,
          total_items: totalCount,
          has_next: hasNext,
          has_previous: hasPrevious,
          next_href: nextHref
        }
      },
      message: tracks.length > 0 
        ? `Found ${tracks.length} tracks for "${query}"` 
        : `No tracks found for "${query}"`
    };

    logger.info(`Search completed: ${tracks.length} tracks found`);
    
    return result;

  } catch (error) {
    logger.error('SoundCloud API error:', error);

    if (error.response) {
      // SoundCloud API error
      const status = error.response.status;
      const message = error.response.data?.message || 'SoundCloud API error';
      
      if (status === 401) {
        throw {
          message: 'Invalid SoundCloud Client ID',
          status: 401
        };
      } else if (status === 429) {
        throw {
          message: 'Rate limit exceeded. Please try again later.',
          status: 429
        };
      } else {
        throw {
          message: `SoundCloud API error: ${message}`,
          status: status
        };
      }
    } else if (error.code === 'ECONNABORTED') {
      throw {
        message: 'Request timeout. Please try again.',
        status: 408
      };
    } else {
      throw {
        message: error.message || 'Failed to search tracks',
        status: error.status || 500
      };
    }
  }
}

/**
 * Get next page of results using next_href
 * @param {string} nextHref - Next page URL from SoundCloud API
 * @returns {Object} Next page results
 */
async function getNextPage(nextHref) {
  try {
    if (!nextHref) {
      throw {
        message: 'No more results available',
        status: 404
      };
    }

    logger.info(`Getting next page: ${nextHref}`);

    const response = await axios.get(nextHref, {
      timeout: 10000
    });

    const data = response.data;
    const tracks = data.collection || [];
    const nextPageHref = data.next_href;

    const result = {
      success: true,
      data: {
        tracks: tracks.map(track => ({
          id: track.id,
          title: track.title,
          description: track.description,
          duration: track.duration,
          artwork_url: track.artwork_url,
          permalink_url: track.permalink_url,
          stream_url: track.stream_url,
          user: {
            id: track.user?.id,
            username: track.user?.username,
            avatar_url: track.user?.avatar_url
          },
          created_at: track.created_at,
          genre: track.genre,
          tag_list: track.tag_list
        })),
        pagination: {
          has_next: !!nextPageHref,
          next_href: nextPageHref
        }
      },
      message: tracks.length > 0 
        ? `Found ${tracks.length} more tracks` 
        : 'No more tracks found'
    };

    if (!nextPageHref) {
      result.message = 'No more results available';
    }

    logger.info(`Next page completed: ${tracks.length} tracks found`);
    
    return result;

  } catch (error) {
    logger.error('Next page error:', error);

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'SoundCloud API error';
      
      throw {
        message: `SoundCloud API error: ${message}`,
        status: status
      };
    } else if (error.code === 'ECONNABORTED') {
      throw {
        message: 'Request timeout. Please try again.',
        status: 408
      };
    } else {
      throw {
        message: error.message || 'Failed to get next page',
        status: error.status || 500
      };
    }
  }
}

module.exports = {
  searchTracks,
  getNextPage
};
