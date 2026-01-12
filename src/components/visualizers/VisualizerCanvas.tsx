import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrayBar } from '@/store/VisualizerContext';

interface VisualizerCanvasProps {
  array: ArrayBar[];
  maxValue?: number;
}

export function VisualizerCanvas({ array, maxValue = 100 }: VisualizerCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const getBarClass = (state: ArrayBar['state']) => {
    switch (state) {
      case 'comparing':
        return 'bar-comparing';
      case 'swapping':
        return 'bar-swapping';
      case 'sorted':
        return 'bar-sorted';
      default:
        return 'bar-default';
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-[400px] bg-card/50 rounded-xl border border-border p-4 flex items-end justify-center gap-[2px]"
    >
      {array.map((bar, index) => {
        const heightPercent = (bar.value / maxValue) * 100;
        const barWidth = Math.max(4, Math.min(40, (containerRef.current?.clientWidth || 800) / array.length - 2));
        
        return (
          <motion.div
            key={index}
            layout
            initial={{ height: 0 }}
            animate={{ height: `${heightPercent}%` }}
            transition={{ duration: 0.1 }}
            className={`visualizer-bar ${getBarClass(bar.state)}`}
            style={{ width: `${barWidth}px` }}
          />
        );
      })}
    </div>
  );
}
