import React from 'react';

const SearchHistory = ({ history, onHistorySearch }) => {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Searches</h3>
      <div className="flex flex-wrap gap-2">
        {history.map((query, index) => (
          <button
            key={index}
            onClick={() => onHistorySearch(query)}
            className="text-sm bg-gray-100 hover:bg-orange-100 text-gray-700 hover:text-orange-700 px-3 py-1 rounded-full transition-colors duration-200"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchHistory;
