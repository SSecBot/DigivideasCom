"use client";

import { useState, useEffect } from "react";

export interface DeviceDetection {
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  isTouch: boolean;
  pointerFine: boolean;
  isMounted: boolean;
  width: number;
  height: number;
}

export function useDeviceDetection(): DeviceDetection {
  const [device, setDevice] = useState<DeviceDetection>({
    isDesktop: true,
    isTablet: false,
    isMobile: false,
    isTouch: false,
    pointerFine: true,
    isMounted: false,
    width: 1920,
    height: 1080,
  });

  useEffect(() => {
    const handleCheck = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const pointerFine = window.matchMedia("(pointer: fine)").matches;
      const isTouch = window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isMobile = w < 768;
      const isTablet = w >= 768 && w < 1024;
      const isDesktop = w >= 1024 && (!isTouch || pointerFine);

      setDevice({
        isDesktop,
        isTablet,
        isMobile,
        isTouch,
        pointerFine,
        isMounted: true,
        width: w,
        height: h,
      });
    };

    handleCheck();
    window.addEventListener("resize", handleCheck, { passive: true });
    return () => window.removeEventListener("resize", handleCheck);
  }, []);

  return device;
}
