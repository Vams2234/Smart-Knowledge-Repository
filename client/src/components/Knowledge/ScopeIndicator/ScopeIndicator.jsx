import React from 'react';
import { motion } from 'framer-motion';

const ScopeIndicator = ({ scope }) => {
  const { confidence, domain } = scope;

  // Determine color based on confidence
  const getColor = (score) => {
    if (score > 80) return 'bg-emerald-500';
    if (score > 50) return 'bg-amber-500';
    return 'bg-slate-300';
  };

  return (
    <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
      <div className="flex flex-col items-end">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          {domain === 'unknown' ? 'Detecting Scope...' : domain}
        </span>
        <span className="text-[10px] text-slate-400 font-medium">
          {confidence > 0 ? `${Math.round(confidence)}% Confidence` : 'Waiting for input'}
        </span>
      </div>
      
      <div className="relative w-10 h-10 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-slate-100" />
          <motion.circle 
            cx="20" cy="20" r="16" stroke="currentColor" strokeWidth="3" fill="transparent" 
            className={`${getColor(confidence).replace('bg-', 'text-')} transition-colors duration-300`}
            strokeDasharray={100}
            animate={{ strokeDashoffset: 100 - confidence }}
            transition={{ duration: 0.5 }}
          />
        </svg>
      </div>
    </div>
  );
};

export default ScopeIndicator;