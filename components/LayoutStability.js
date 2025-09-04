import { useEffect } from 'react';

export const LayoutStability = () => {
  useEffect(() => {
    // Add CSS custom properties for layout stability
    const root = document.documentElement;
    
    // Set font fallback metrics
    root.style.setProperty('--font-roboto-fallback', 'Arial, sans-serif');
    root.style.setProperty('--font-instruments-fallback', 'Arial, sans-serif');
    
    // Prevent layout shift from scrollbar
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    root.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
    
    // Add stability classes
    const style = document.createElement('style');
    style.textContent = `
      .layout-stable {
        contain: layout style;
      }
      .aspect-ratio-stable {
        aspect-ratio: attr(data-aspect-ratio);
      }
      .min-height-stable {
        min-height: var(--min-height, 1px);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return null;
};