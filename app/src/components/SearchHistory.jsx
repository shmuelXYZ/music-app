import React, { useState } from 'react';
import { 
  getSearchHistoryLimit, 
  setSearchHistoryLimit, 
  reorderSearchHistory,
  removeFromSearchHistory 
} from '../utils/localStorage';

const SearchHistory = ({ history, onHistorySearch, onHistoryUpdate }) => {
  const [historyLimit, setHistoryLimitState] = useState(() => {
    try {
      return getSearchHistoryLimit();
    } catch (error) {
      console.error('Error getting search history limit:', error);
      return 5; // fallback value
    }
  });
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value, 10);
    if (newLimit >= 1 && newLimit <= 50) {
      setHistoryLimitState(newLimit);
      const updatedHistory = setSearchHistoryLimit(newLimit);
      if (onHistoryUpdate) {
        onHistoryUpdate(updatedHistory);
      }
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      return;
    }

    const newHistory = [...history];
    const draggedItem = newHistory[draggedIndex];
    
    // Remove the dragged item
    newHistory.splice(draggedIndex, 1);
    
    // Insert at new position
    newHistory.splice(dropIndex, 0, draggedItem);
    
    // Update localStorage and parent component
    const updatedHistory = reorderSearchHistory(newHistory);
    if (onHistoryUpdate) {
      onHistoryUpdate(updatedHistory);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDeleteItem = (e, queryToDelete) => {
    e.stopPropagation(); // Prevent triggering the search
    const updatedHistory = removeFromSearchHistory(queryToDelete);
    if (onHistoryUpdate) {
      onHistoryUpdate(updatedHistory);
    }
  };

  // Show the component even when history is empty
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700">Recent Searches</h3>
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Limit:</label>
          <input
            type="number"
            min="1"
            max="50"
            value={historyLimit}
            onChange={handleLimitChange}
            className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>
      
      {(!history || history.length === 0) ? (
        <p className="text-sm text-gray-500 italic">No recent searches</p>
      ) : (
        <>
          <div className="space-y-2">
            {history.map((query, index) => (
              <div
                key={`${query}-${index}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                className={`
                  flex items-center bg-gray-50 hover:bg-orange-50 rounded-lg border transition-all duration-200 cursor-move overflow-hidden
                  ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                  ${dragOverIndex === index && draggedIndex !== index ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}
                `}
              >
                {/* Drag handle */}
                <div className="flex items-center justify-center w-8 h-10 text-gray-400 hover:text-gray-600 transition-colors">
                  <div className="flex flex-col gap-0.5">
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                    <div className="w-1 h-1 bg-current rounded-full"></div>
                  </div>
                </div>
                
                {/* Left divider */}
                <div className="w-px bg-gray-200 h-6"></div>
                
                {/* Search button */}
                <button
                  onClick={() => onHistorySearch(query)}
                  className="flex-1 px-3 py-2 text-left text-sm text-gray-700 hover:text-orange-700 transition-colors duration-200 min-w-0"
                >
                  <span className="truncate block">{query}</span>
                </button>
                
                {/* Right divider */}
                <div className="w-px bg-gray-200 h-6"></div>
                
                {/* Delete button */}
                <button
                  onClick={(e) => handleDeleteItem(e, query)}
                  className="flex items-center justify-center w-8 h-10 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200"
                  title="Delete search"
                >
                  <svg 
                    width="12" 
                    height="12" 
                    viewBox="0 0 12 12" 
                    fill="none" 
                    className="stroke-current"
                  >
                    <path 
                      d="M9 3L3 9M3 3l6 6" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          {history.length >= historyLimit && (
            <p className="text-xs text-gray-400 mt-2 text-center">
              History limit reached ({historyLimit} items)
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default SearchHistory;
