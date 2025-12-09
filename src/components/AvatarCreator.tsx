'use client';

import { useState } from 'react';
import { Palette, Shuffle } from 'lucide-react';

// Avatar configuration based on drawing/art theme
export const AVATAR_CONFIG = {
  colors: [
    { name: 'Canvas', bg: '#F5F5DC', stroke: '#8B7355' },
    { name: 'Charcoal', bg: '#36454F', stroke: '#1C1C1C' },
    { name: 'Rose', bg: '#FFB6C1', stroke: '#C71585' },
    { name: 'Sky', bg: '#87CEEB', stroke: '#4682B4' },
    { name: 'Mint', bg: '#98FF98', stroke: '#2E8B57' },
    { name: 'Sunset', bg: '#FFD700', stroke: '#FF8C00' },
    { name: 'Lavender', bg: '#E6E6FA', stroke: '#9370DB' },
    { name: 'Coral', bg: '#FF7F50', stroke: '#DC143C' },
  ],
  eyes: [
    { name: 'Dots', path: 'M30,40 L30,40 M70,40 L70,40' },
    { name: 'Happy', path: 'M25,35 Q30,40 35,35 M65,35 Q70,40 75,35' },
    { name: 'Focused', path: 'M20,40 L40,40 M60,40 L80,40' },
    { name: 'Starry', path: 'M30,35 L32,42 L25,38 L35,38 L28,42 Z M70,35 L72,42 L65,38 L75,38 L68,42 Z' },
    { name: 'Wink', path: 'M25,35 Q30,40 35,35 M60,40 L80,40' },
    { name: 'Sleepy', path: 'M20,42 L40,38 M60,42 L80,38' },
  ],
  mouths: [
    { name: 'Smile', path: 'M35,65 Q50,75 65,65' },
    { name: 'Grin', path: 'M30,65 Q50,80 70,65' },
    { name: 'Neutral', path: 'M35,65 L65,65' },
    { name: 'Surprised', path: 'M50,65 m-8,0 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0' },
    { name: 'Thinking', path: 'M35,65 Q45,68 55,65' },
    { name: 'Whistle', path: 'M45,65 Q50,60 55,65 M50,60 L50,55' },
  ],
  accessories: [
    { name: 'None', path: '' },
    { name: 'Brush', path: 'M85,15 L90,10 L95,15 L90,20 Z M85,15 L75,25' },
    { name: 'Palette', path: 'M10,15 Q15,10 20,15 Q25,20 20,25 Q15,30 10,25 Q5,20 10,15 M12,17 L12,17 M18,17 L18,17 M15,22 L15,22' },
    { name: 'Pencil', path: 'M85,10 L95,20 M88,13 L92,17' },
    { name: 'Star', path: 'M50,5 L52,12 L60,12 L54,17 L56,24 L50,19 L44,24 L46,17 L40,12 L48,12 Z' },
    { name: 'Crown', path: 'M35,10 L40,5 L45,10 L50,5 L55,10 L60,5 L65,10 L65,15 L35,15 Z' },
  ],
};

interface AvatarCreatorProps {
  avatar: number[];
  onChange: (avatar: number[]) => void;
}

export default function AvatarCreator({ avatar, onChange }: AvatarCreatorProps) {
  const [colorIdx, eyeIdx, mouthIdx, accessoryIdx] = avatar;

  const randomize = () => {
    onChange([
      Math.floor(Math.random() * AVATAR_CONFIG.colors.length),
      Math.floor(Math.random() * AVATAR_CONFIG.eyes.length),
      Math.floor(Math.random() * AVATAR_CONFIG.mouths.length),
      Math.floor(Math.random() * AVATAR_CONFIG.accessories.length),
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Avatar Preview */}
      <div className="flex justify-center">
        <div className="relative">
          <AvatarDisplay avatar={avatar} size={120} />
          <button
            onClick={randomize}
            className="absolute -bottom-2 -right-2 p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:scale-110 transition-transform"
            aria-label="Randomize avatar"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Customization Options */}
      <div className="space-y-3">
        {/* Color */}
        <div>
          <label className="block text-sm text-white/70 mb-2 flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Color
          </label>
          <div className="grid grid-cols-4 gap-2">
            {AVATAR_CONFIG.colors.map((color, idx) => (
              <button
                key={idx}
                onClick={() => onChange([idx, eyeIdx, mouthIdx, accessoryIdx])}
                className={`h-10 rounded-lg border-2 transition ${
                  colorIdx === idx ? 'border-white scale-110' : 'border-white/20'
                }`}
                style={{ backgroundColor: color.bg }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Eyes */}
        <div>
          <label className="block text-sm text-white/70 mb-2">Eyes</label>
          <div className="grid grid-cols-3 gap-2">
            {AVATAR_CONFIG.eyes.map((eye, idx) => (
              <button
                key={idx}
                onClick={() => onChange([colorIdx, idx, mouthIdx, accessoryIdx])}
                className={`p-2 rounded-lg border transition ${
                  eyeIdx === idx
                    ? 'border-white bg-white/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <svg viewBox="0 0 100 100" className="w-full h-8">
                  <path
                    d={eye.path}
                    stroke="white"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-xs text-white/60 block text-center mt-1">{eye.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mouth */}
        <div>
          <label className="block text-sm text-white/70 mb-2">Mouth</label>
          <div className="grid grid-cols-3 gap-2">
            {AVATAR_CONFIG.mouths.map((mouth, idx) => (
              <button
                key={idx}
                onClick={() => onChange([colorIdx, eyeIdx, idx, accessoryIdx])}
                className={`p-2 rounded-lg border transition ${
                  mouthIdx === idx
                    ? 'border-white bg-white/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <svg viewBox="0 0 100 100" className="w-full h-8">
                  <path
                    d={mouth.path}
                    stroke="white"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="text-xs text-white/60 block text-center mt-1">{mouth.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Accessory */}
        <div>
          <label className="block text-sm text-white/70 mb-2">Accessory</label>
          <div className="grid grid-cols-3 gap-2">
            {AVATAR_CONFIG.accessories.map((acc, idx) => (
              <button
                key={idx}
                onClick={() => onChange([colorIdx, eyeIdx, mouthIdx, idx])}
                className={`p-2 rounded-lg border transition ${
                  accessoryIdx === idx
                    ? 'border-white bg-white/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <svg viewBox="0 0 100 100" className="w-full h-8">
                  {acc.path && (
                    <path
                      d={acc.path}
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                    />
                  )}
                </svg>
                <span className="text-xs text-white/60 block text-center mt-1">{acc.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Avatar Display Component
export function AvatarDisplay({ avatar, size = 40 }: { avatar: number[]; size?: number }) {
  const [colorIdx = 0, eyeIdx = 0, mouthIdx = 0, accessoryIdx = 0] = avatar;
  const color = AVATAR_CONFIG.colors[colorIdx] || AVATAR_CONFIG.colors[0];
  const eyes = AVATAR_CONFIG.eyes[eyeIdx] || AVATAR_CONFIG.eyes[0];
  const mouth = AVATAR_CONFIG.mouths[mouthIdx] || AVATAR_CONFIG.mouths[0];
  const accessory = AVATAR_CONFIG.accessories[accessoryIdx] || AVATAR_CONFIG.accessories[0];

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className="rounded-full"
      style={{ backgroundColor: color.bg }}
    >
      {/* Face circle */}
      <circle cx="50" cy="50" r="45" fill={color.bg} stroke={color.stroke} strokeWidth="3" />

      {/* Eyes */}
      <path
        d={eyes.path}
        stroke={color.stroke}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Mouth */}
      <path
        d={mouth.path}
        stroke={color.stroke}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* Accessory */}
      {accessory.path && (
        <path
          d={accessory.path}
          stroke={color.stroke}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
