"use client";

import React, { useEffect, useState } from "react";

interface CursorSpotlightProps {
  className?: string;
  size?: number;
  color?: string;
  opacity?: number;
}

export function CursorSpotlight({
  className = "",
  size = 500,
  color = "rgba(249, 115, 22, 0.15)",
  opacity = 1,
}: CursorSpotlightProps) {
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <div
        className="pointer-events-none fixed transition-opacity duration-200"
        style={{
          top: 0,
          left: 0,
          width: `${size}px`,
          height: `${size}px`,
          transform: `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) translate(-50%, -50%)`,
          borderRadius: "50%",
          background: `radial-gradient(circle at center, ${color} 0%, rgba(249, 115, 22, 0.05) 40%, rgba(9, 9, 11, 0) 70%)`,
          opacity: isVisible ? opacity : 0,
          willChange: "transform",
        }}
      />
    </div>
  );
}
