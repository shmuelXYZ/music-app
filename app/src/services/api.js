import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.message || 'Invalid request');
        case 401:
          throw new Error(data.message || 'Invalid SoundCloud credentials');
        case 404:
          throw new Error('No tracks found');
        case 429:
          throw new Error('Too many requests. Please try again later.');
        case 500:
          throw new Error('Server error. Please try again later.');
        default:
          throw new Error(data.message || `Error ${status}: ${data.error || 'Unknown error'}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your connection.');
    } else {
      // Other error
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
);

/**
 * Search for videos on YouTube
 * @param {string} query - The search query
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Results per page (default: 6)
 * @param {string} pageToken - Page token for pagination
 * @returns {Promise<Object>} Search results
 */
export const searchTracks = async (query, page = 1, limit = 6, pageToken = null) => {
  try {
    const params = {
      q: query,
      page,
      limit
    };

    // Add page token if provided
    if (pageToken) {
      params.pageToken = pageToken;
    }

    const response = await api.get('/youtube/search', { params });

    return response.data;
  } catch (error) {
    console.error('Search videos error:', error);
    throw error;
  }
};

/**
 * Get next page of results using page token
 * @param {string} pageToken - The page token from previous response
 * @param {string} originalQuery - The original search query
 * @param {number} limit - Results per page
 * @returns {Promise<Object>} Next page results
 */
export const getNextPage = async (pageToken, originalQuery = '', limit = 6) => {
  try {
    const response = await api.get('/youtube/next', {
      params: {
        pageToken,
        q: originalQuery,
        limit
      }
    });

    return response.data;
  } catch (error) {
    console.error('Get next page error:', error);
    throw error;
  }
};

/**
 * Check if the API is available
 * @returns {Promise<boolean>} API health status
 */
export const checkApiHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

export default api;
