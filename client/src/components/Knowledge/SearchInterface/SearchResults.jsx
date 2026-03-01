import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { motion } from 'framer-motion';

const SearchResults = ({ results = [], viewMode, isSearching, onSelect, bookmarkedIds, onToggleBookmark }) => {
  const parentRef = useRef();

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(results.length / (viewMode === 'grid' ? 3 : 1)),
    getScrollElement: () => parentRef.current,
    estimateSize: () => viewMode === 'grid' ? 200 : 120,
    overscan: 5,
  });

  if (isSearching) {
    return (
      <div className={`p-8 grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm animate-pulse">
            <div className="flex space-x-4">
              <div className="rounded-full bg-slate-200 dark:bg-slate-700 h-12 w-12"></div>
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                <div className="flex gap-2 mt-2">
                  <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded w-16"></div>
                  <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div 
      ref={parentRef} 
      className="h-full w-full overflow-auto p-8"
    >
      {results.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 min-h-[200px]">
          <p className="text-lg">No results found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * (viewMode === 'grid' ? 3 : 1);
          const rowItems = results.slice(startIndex, startIndex + (viewMode === 'grid' ? 3 : 1));

          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className={viewMode === 'grid' ? "flex gap-4" : "flex flex-col gap-2"}
            >
              {rowItems.map((item) => (
                <ResultCard 
                  key={item.id} 
                  item={item} 
                  viewMode={viewMode} 
                  onClick={() => onSelect(item)} 
                  isBookmarked={bookmarkedIds && bookmarkedIds.has(item.id)}
                  onToggleBookmark={(e) => { e.stopPropagation(); onToggleBookmark(item); }}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ResultCard = ({ item, viewMode, onClick, isBookmarked, onToggleBookmark }) => {
  const isGrid = viewMode === 'grid';
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={`
        bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-blue-200 dark:hover:border-blue-500/30 transition-all cursor-pointer group
        ${isGrid ? 'flex-1' : 'w-full flex items-center justify-between'}
      `}
    >
      <div className="absolute top-4 right-4 z-10">
        <button onClick={onToggleBookmark} className={`text-xl transition-colors ${isBookmarked ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-600 hover:text-slate-400 dark:hover:text-slate-400'}`}>
          {isBookmarked ? '★' : '☆'}
        </button>
      </div>

      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md ring-4 ring-blue-50">
          {item.name.charAt(0)}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-lg">{item.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{item.role} • {item.department}</p>
          
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.expertise && item.expertise.map(skill => (
              <span key={skill} className="px-2.5 py-1 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-md border border-slate-200 dark:border-slate-600 font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {!isGrid && (
        <div className="text-right">
          <div className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
            {item.relevanceScore ? Math.round(item.relevanceScore) : 0}% Match
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SearchResults;