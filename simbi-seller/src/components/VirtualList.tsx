// @ts-nocheck
"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";

export default function VirtualList<T>({
  items,
  rowHeight = 40,
  height = 400,
  overscan = 5,
  renderItem,
}: {
  items: T[];
  rowHeight?: number;
  height?: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const onScroll = useCallback(() => {
    if (!containerRef.current) return;
    setScrollTop(containerRef.current.scrollTop);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const totalHeight = items.length * rowHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(items.length - 1, Math.floor((scrollTop + height) / rowHeight) + overscan);
  const offsetY = startIndex * rowHeight;

  const visible = items.slice(startIndex, endIndex + 1);

  return (
    <div ref={containerRef} style={{ height, overflow: "auto" }}>
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visible.map((item, i) => (
            <div key={startIndex + i} style={{ height: rowHeight }}>{renderItem(item, startIndex + i)}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
