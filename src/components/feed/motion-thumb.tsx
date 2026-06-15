"use client";

import { useEffect, useState } from "react";

interface MotionThumbProps {
  photos: string[];
  alt: string;
  className?: string;
}

// Diaporama en fondu (effet "GIF") pour les publications boostées avec
// plusieurs photos.
export function MotionThumb({ photos, alt, className }: MotionThumbProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (photos.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % photos.length);
    }, 1500);
    return () => clearInterval(id);
  }, [photos.length]);

  if (photos.length === 0) {
    return <div className={`bg-gradient-to-br from-primary/20 to-accent/20 ${className ?? ""}`} />;
  }

  if (photos.length === 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={photos[0]} alt={alt} className={`object-cover ${className ?? ""}`} />
    );
  }

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {photos.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt={alt}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  );
}
