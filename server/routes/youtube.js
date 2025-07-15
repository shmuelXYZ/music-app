const express = require('express');
const { searchVideos, getNextPage } = require('../services/youtubeService');
const { logger } = require('../utils/logger');

const router = express.Router();

/**
 * Search YouTube videos with pagination
 * GET /api/youtube/search
 * Query params:
 * - q: search query (required)
 * - page: page number (optional, defaults to 1)
 * - limit: items per page (optional, defaults to 6, max 50)
 * - pageToken: page token for pagination (optional)
 */
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 6, pageToken } = req.query;

    // Validate required parameters
    if (!q || q.trim() === '') {
      return res.status(400).json({
        error: {
          message: 'Search query is required',
          status: 400
        }
      });
    }

    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
      return res.status(400).json({
        error: {
          message: 'Page must be a positive integer',
          status: 400
        }
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        error: {
          message: 'Limit must be between 1 and 50',
          status: 400
        }
      });
    }

    logger.info(`YouTube search request: query="${q}", page=${pageNum}, limit=${limitNum}, pageToken=${pageToken}`);

    const result = await searchVideos(q, pageNum, limitNum, pageToken);

    res.json(result);

  } catch (error) {
    logger.error('YouTube search error:', error);
    
    if (error.status) {
      return res.status(error.status).json({
        error: {
          message: error.message,
          status: error.status
        }
      });
    }

    res.status(500).json({
      error: {
        message: 'Failed to search videos',
        status: 500
      }
    });
  }
});

/**
 * Get next page of results
 * GET /api/youtube/next
 * Query params:
 * - pageToken: page token from previous response (required)
 * - q: original search query (optional, for context)
 * - limit: items per page (optional, defaults to 6)
 */
router.get('/next', async (req, res) => {
  try {
    const { pageToken, q = '', limit = 6 } = req.query;

    if (!pageToken) {
      return res.status(400).json({
        error: {
          message: 'pageToken parameter is required',
          status: 400
        }
      });
    }

    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        error: {
          message: 'Limit must be between 1 and 50',
          status: 400
        }
      });
    }

    logger.info(`YouTube next page request: pageToken=${pageToken}, query="${q}", limit=${limitNum}`);

    const result = await getNextPage(pageToken, q, limitNum);

    res.json(result);

  } catch (error) {
    logger.error('Get next page error:', error);
    
    if (error.status) {
      return res.status(error.status).json({
        error: {
          message: error.message,
          status: error.status
        }
      });
    }

    res.status(500).json({
      error: {
        message: 'Failed to get next page',
        status: 500
      }
    });
  }
});

/**
 * Get video details by ID
 * GET /api/youtube/video/:id
 * Path params:
 * - id: YouTube video ID (required)
 */
router.get('/video/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: {
          message: 'Video ID is required',
          status: 400
        }
      });
    }

    // This would need additional implementation to get video details
    // For now, return basic info
    res.json({
      id: id,
      video_url: `https://www.youtube.com/watch?v=${id}`,
      embed_url: `https://www.youtube.com/embed/${id}`,
      message: 'Video details endpoint - additional implementation needed'
    });

  } catch (error) {
    logger.error('Get video details error:', error);
    
    res.status(500).json({
      error: {
        message: 'Failed to get video details',
        status: 500
      }
    });
  }
});

module.exports = router;
