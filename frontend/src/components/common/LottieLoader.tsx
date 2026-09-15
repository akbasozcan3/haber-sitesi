"use client";

import { useEffect, useRef } from "react";
import lottie, { type AnimationItem } from "lottie-web";
import { loadingAnimationData } from "@/assets/loadingAnimation";

interface LottieLoaderProps {
  size?: number;
  className?: string;
}

export default function LottieLoader({ size = 120, className = "" }: LottieLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    animRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData: loadingAnimationData,
    });

    return () => {
      animRef.current?.destroy();
      animRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`flex items-center justify-center select-none ${className}`}
      aria-label="Loading"
    />
  );
}
