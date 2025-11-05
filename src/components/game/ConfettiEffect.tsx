// src/components/game/ConfettiEffect.tsx
'use client';

import { useGameStore } from '@/store/useGameStore';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

export default function ConfettiEffect() {
  const { confetti } = useGameStore();
  const { width, height } = useWindowSize();

  if (!confetti) return null;

  return (
    <Confetti
      width={width}
      height={height}
      recycle={false}
      numberOfPieces={200}
      gravity={0.15}
      initialVelocityY={-10}
      colors={['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']}
      confettiSource={{
        x: width / 2,
        y: height / 2,
        w: 10,
        h: 10,
      }}
      opacity={0.9}
    />
  );
}