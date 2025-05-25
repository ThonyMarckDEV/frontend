import React, { useEffect } from 'react';

function LoadingScreen() {
  // Prevent background scrolling when LoadingScreen is displayed
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Cleanup: Restore original overflow when component unmounts
    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, []);

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-50 z-[9999]">
      {/* Spinner */}
      <div className="animate-spin inline-block w-16 h-16 border-4 rounded-full border-t-transparent border-solid border-pink-800"></div>
    </div>
  );
}

export default LoadingScreen;