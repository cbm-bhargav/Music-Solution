import { useState, useEffect } from 'react';

const useIntersectionObserver = (ref, options) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [enteredViewport, setEnteredViewport] = useState(false);

  useEffect(() => {
    if (!ref || !ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      entry.isIntersecting && setEnteredViewport(true);
    }, options);

    observer.observe(ref.current);

    return () => {
      if (ref?.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return {
    isIntersecting,
    enteredViewport,
  };
};

export default useIntersectionObserver;
