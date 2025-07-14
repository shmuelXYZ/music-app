const express = require('express');
const { searchTracks, getNextPage } = require('../services/soundcloudService');
const { logger } = require('../utils/logger');

const router = express.Router();

/**
 * Search SoundCloud tracks with pagination
 * GET /api/soundcloud/search
 * Query params:
 * - q: search query (required)
 * - page: page number (optional, defaults to 1)
 * - limit: items per page (optional, defaults to 6)
 */
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 6 } = req.query;

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

    logger.info(`Search request: query="${q}", page=${pageNum}, limit=${limitNum}`);

    const result = await searchTracks(q, pageNum, limitNum);

    res.json(result);

  } catch (error) {
    logger.error('Search error:', error);
    
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
        message: 'Failed to search tracks',
        status: 500
      }
    });
  }
});

/**
 * Get next page of results
 * GET /api/soundcloud/next
 * Query params:
 * - nextHref: next page URL from previous response (required)
 */
router.get('/next', async (req, res) => {
  try {
    const { nextHref } = req.query;

    if (!nextHref) {
      return res.status(400).json({
        error: {
          message: 'nextHref parameter is required',
          status: 400
        }
      });
    }

    logger.info(`Next page request: ${nextHref}`);

    const result = await getNextPage(nextHref);

    res.json(result);

  } catch (error) {
    logger.error('Next page error:', error);
    
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

module.exports = router;
