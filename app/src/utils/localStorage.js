// localStorage utility functions for search history

const SEARCH_HISTORY_KEY = 'youtube_search_history';
const SEARCH_HISTORY_LIMIT_KEY = 'youtube_search_history_limit';
const DEFAULT_MAX_HISTORY_ITEMS = 5;

/**
 * Get the current search history limit
 * @returns {number} The maximum number of history items to keep
 */
export const getSearchHistoryLimit = () => {
  try {
    const limit = localStorage.getItem(SEARCH_HISTORY_LIMIT_KEY);
    return limit ? parseInt(limit, 10) : DEFAULT_MAX_HISTORY_ITEMS;
  } catch (error) {
    console.error('Error getting search history limit:', error);
    return DEFAULT_MAX_HISTORY_ITEMS;
  }
};

/**
 * Set the search history limit
 * @param {number} limit - The new limit for search history items
 * @returns {string[]} Updated search history (trimmed if necessary)
 */
export const setSearchHistoryLimit = (limit) => {
  try {
    const newLimit = Math.max(1, Math.min(50, parseInt(limit, 10))); // Limit between 1-50
    localStorage.setItem(SEARCH_HISTORY_LIMIT_KEY, newLimit.toString());
    
    // Get current history and trim if necessary
    let history = getSearchHistory();
    if (history.length > newLimit) {
      history = history.slice(0, newLimit);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    }
    
    return history;
  } catch (error) {
    console.error('Error setting search history limit:', error);
    return getSearchHistory();
  }
};

/**
 * Reorder search history
 * @param {string[]} newOrder - The new order of search history items
 * @returns {string[]} Updated search history
 */
export const reorderSearchHistory = (newOrder) => {
  try {
    if (!Array.isArray(newOrder)) {
      return getSearchHistory();
    }

    const limit = getSearchHistoryLimit();
    const trimmedOrder = newOrder.slice(0, limit);
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmedOrder));
    return trimmedOrder;
  } catch (error) {
    console.error('Error reordering search history:', error);
    return getSearchHistory();
  }
};

/**
 * Get search history from localStorage
 * @returns {string[]} Array of search queries
 */
export const getSearchHistory = () => {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
};

/**
 * Add a search query to history
 * @param {string} query - The search query to add
 * @returns {string[]} Updated search history
 */
export const addToSearchHistory = (query) => {
  try {
    if (!query || typeof query !== 'string') {
      return getSearchHistory();
    }

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return getSearchHistory();
    }

    let history = getSearchHistory();
    
    // Remove the query if it already exists (to move it to the front)
    history = history.filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase());
    
    // Add the new query to the beginning
    history.unshift(trimmedQuery);
    
    // Keep only the most recent items based on current limit
    const limit = getSearchHistoryLimit();
    history = history.slice(0, limit);
    
    // Save to localStorage
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    
    return history;
  } catch (error) {
    console.error('Error adding to search history:', error);
    return getSearchHistory();
  }
};

/**
 * Clear all search history
 * @returns {string[]} Empty array
 */
export const clearSearchHistory = () => {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    return [];
  } catch (error) {
    console.error('Error clearing search history:', error);
    return [];
  }
};

/**
 * Remove a specific query from search history
 * @param {string} queryToRemove - The query to remove
 * @returns {string[]} Updated search history
 */
export const removeFromSearchHistory = (queryToRemove) => {
  try {
    if (!queryToRemove || typeof queryToRemove !== 'string') {
      return getSearchHistory();
    }

    const trimmedQuery = queryToRemove.trim();
    if (!trimmedQuery) {
      return getSearchHistory();
    }

    let history = getSearchHistory();
    
    // Remove the query
    history = history.filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase());
    
    // Save to localStorage
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    
    return history;
  } catch (error) {
    console.error('Error removing from search history:', error);
    return getSearchHistory();
  }
};

/**
 * Check if localStorage is available
 * @returns {boolean} Whether localStorage is supported
 */
export const isLocalStorageAvailable = () => {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    console.warn('localStorage is not available:', error);
    return false;
  }
};
