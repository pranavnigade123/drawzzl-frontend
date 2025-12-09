'use client';

import { useEffect, useState } from 'react';
import { TrendingDown } from 'lucide-react';

interface PointsIndicatorProps {
  timeLeft: number;
  maxTime: number;
}

const MAX_POINTS = 500;
const MIN_POINTS = 50;

export default function PointsIndicator({ timeLeft, maxTime }: PointsIndicatorProps) {
  const [currentPoints, setCurrentPoints] = useState(MAX_POINTS);

  useEffect(() => {
    // Calculate points based on 5-second intervals
    const intervalTime = Math.floor(timeLeft / 5) * 5;
    const percentage = intervalTime / maxTime;
    const points = Math.floor(MAX_POINTS * percentage);
    const finalPoints = Math.max(MIN_POINTS, points);
    setCurrentPoints(finalPoints);
  }, [timeLeft, maxTime]);

  // Calculate color based on points
  const getColor = () => {
    const percentage = (currentPoints - MIN_POINTS) / (MAX_POINTS - MIN_POINTS);
    if (percentage > 0.7) return 'text-green-400';
    if (percentage > 0.4) return 'text-yellow-400';
    if (percentage > 0.2) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
      <TrendingDown className={`h-4 w-4 ${getColor()} transition-colors`} />
      <span className={`text-sm font-bold ${getColor()} transition-colors`}>
        {currentPoints} pts
      </span>
    </div>
  );
}
