
import React from "react";

const BackgroundStars: React.FC = () => {
  return (
    <>
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            width: `${Math.random() * 2 + 1}px`,
            height: `${Math.random() * 2 + 1}px`,
            backgroundColor: 'white',
            borderRadius: '50%',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.7 + 0.3,
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)'
          }}
        />
      ))}
    </>
  );
};

export default BackgroundStars;
