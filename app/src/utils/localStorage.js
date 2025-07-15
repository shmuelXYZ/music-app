// localStorage utility functions for search history

const SEARCH_HISTORY_KEY = 'soundcloud_search_history';
const MAX_HISTORY_ITEMS = 5;

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
    
    // Keep only the most recent MAX_HISTORY_ITEMS
    history = history.slice(0, MAX_HISTORY_ITEMS);
    
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
