import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import TrackList from './components/TrackList';
import SearchHistory from './components/SearchHistory';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { searchTracks, getNextPage } from './services/api';
import { getSearchHistory, addToSearchHistory } from './utils/localStorage';

function App() {
  const [tracks, setTracks] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [nextPageToken, setNextPageToken] = useState(null);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    // Load search history from localStorage on component mount
    setSearchHistory(getSearchHistory());
  }, []);

  const handleSearch = async (query) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setCurrentQuery(query);

    try {
      const data = await searchTracks(query);
      setTracks(data.tracks);
      setHasNextPage(data.hasNext);
      setNextPageToken(data.nextHref);
      setTotalResults(data.totalResults || 0);

      // Add to search history
      const updatedHistory = addToSearchHistory(query);
      setSearchHistory(updatedHistory);
    } catch (err) {
      setError(err.message || 'An error occurred while searching');
      setTracks([]);
      setHasNextPage(false);
      setNextPageToken(null);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!hasNextPage || !nextPageToken || loading) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getNextPage(nextPageToken, currentQuery);
      setTracks(prevTracks => [...prevTracks, ...data.tracks]);
      setHasNextPage(data.hasNext);
      setNextPageToken(data.nextHref);
    } catch (err) {
      setError(err.message || 'An error occurred while loading more videos');
    } finally {
      setLoading(false);
    }
  };

  const handleHistorySearch = (query) => {
    handleSearch(query);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            YouTube Music Search
          </h1>
          <p className="text-gray-600">
            Discover amazing music videos on YouTube
          </p>
        </header>

        {/* Search Section */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar 
            onSearch={handleSearch} 
            loading={loading}
            initialQuery={currentQuery}
          />
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="max-w-2xl mx-auto mb-8">
            <SearchHistory 
              history={searchHistory}
              onHistorySearch={handleHistorySearch}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Results Section */}
        {currentQuery && !loading && tracks.length === 0 && !error && (
          <div className="text-center text-gray-600">
            <p>No videos found for "{currentQuery}"</p>
            <p className="text-sm mt-2">Try a different search term</p>
          </div>
        )}

        {tracks.length > 0 && (
          <div className="max-w-4xl mx-auto">
            {/* Results Info */}
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                Showing {tracks.length} videos
                {totalResults > 0 && ` of ${totalResults.toLocaleString()} results`} 
                for "{currentQuery}"
              </p>
            </div>

            {/* Track List */}
            <TrackList tracks={tracks} />

            {/* Load More Button */}
            {hasNextPage && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load More Videos'}
                </button>
              </div>
            )}

            {/* No More Results Message */}
            {!hasNextPage && tracks.length > 0 && (
              <div className="text-center mt-8">
                <p className="text-gray-600">
                  No more videos to load
                </p>
              </div>
            )}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && tracks.length === 0 && (
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
