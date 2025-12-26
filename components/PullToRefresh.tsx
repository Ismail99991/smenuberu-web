// components/PullToRefresh.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [pullDistance, setPullDistance] = useState(0);
  const [showSpinner, setShowSpinner] = useState(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0 && !isRefreshing) {
      setStartY(e.touches[0].clientY);
      setPullDistance(0);
    }
  }, [isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (startY && window.scrollY === 0 && !isRefreshing) {
      const currentY = e.touches[0].clientY;
      const distance = Math.max(0, currentY - startY);
      
      if (distance > 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance, 80));
      }
    }
  }, [startY, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > 50 && !isRefreshing) {
      setIsRefreshing(true);
      setShowSpinner(true);
      
      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setShowSpinner(false);
        }, 500);
      }
    }
    
    setStartY(0);
    setPullDistance(0);
  }, [pullDistance, isRefreshing, onRefresh]);

  useEffect(() => {
    const container = document.documentElement;
    
    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);
    
    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const pullProgress = Math.min(pullDistance / 80, 1);

  return (
    <>
      {/* Индикатор pull-to-refresh */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-200 pointer-events-none"
        style={{
          transform: `translateY(${Math.min(pullDistance, 80) - 80}px)`,
          opacity: pullDistance > 10 ? 1 : 0,
        }}
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg">
          <RefreshCw 
            size={24} 
            className={`text-brand transition-transform duration-200 ${
              isRefreshing ? "animate-spin" : ""
            }`}
            style={{
              transform: `rotate(${pullProgress * 360}deg)`,
            }}
          />
        </div>
      </div>

      {/* Содержимое страницы */}
      <div className={isRefreshing ? "opacity-50 pointer-events-none" : ""}>
        {children}
      </div>
    </>
  );
}