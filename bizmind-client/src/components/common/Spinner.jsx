import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`inline-block animate-spin rounded-full border-2 border-slate-200 dark:border-slate-800 border-t-indigo-600 ${sizes[size]} ${className}`} />
  );
};
