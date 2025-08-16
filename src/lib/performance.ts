// Performance optimization utilities
import React from 'react';

export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start}ms`);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Lazy load utility
export const lazyLoad = <T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType<any>
) => {
  return React.lazy(() => 
    importFunc().catch(() => {
      if (fallback) {
        return { default: fallback };
      }
      throw new Error('Failed to load component');
    })
  );
};

// Preload critical components
export const preloadComponent = (importFunc: () => Promise<any>) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'script';
  document.head.appendChild(link);
  
  // Start loading in background
  importFunc();
};
