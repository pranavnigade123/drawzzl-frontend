'use client';

import React from 'react';
import { AvatarDisplay } from './AvatarCreator';

interface Player {
  name: string;
  score: number;
  avatar?: number[];
}

interface WordSelectionModalProps {
  isOpen: boolean;
  wordChoices: string[];
  wordSelectionTime: number;
  wordSelectionScores: Player[];
  onSelectWord: (word: string) => void;
}

export default function WordSelectionModal({
  isOpen,
  wordChoices,
  wordSelectionTime,
  wordSelectionScores,
  onSelectWord,
}: WordSelectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-zinc-900 rounded-2xl border border-white/10 p-4 md:p-6 max-w-2xl w-full shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
        {/* Current Scores */}
        {wordSelectionScores.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3 text-center">Current Scores</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
              {wordSelectionScores.map((player, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-colors hover:bg-white/10"
                >
                  <div className="flex items-center gap-2">
                    <AvatarDisplay avatar={player.avatar || [0, 0, 0, 0]} size={24} />
                    <span className="text-white text-sm font-medium">{player.name}</span>
                  </div>
                  <span className="text-white/80 text-sm font-bold">{player.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Word Selection (only for drawer) */}
        {wordChoices.length > 0 ? (
          <>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2 text-center">Choose a Word</h2>
            <p className="text-white/60 text-center mb-6 text-sm md:text-base">You have {wordSelectionTime} seconds to choose</p>
            <div className="space-y-3">
              {wordChoices.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectWord(word)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 border border-white/20 text-white font-semibold text-base md:text-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  {word}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Drawer is Selecting...</h2>
            <p className="text-white/60 text-center">Please wait while the drawer chooses a word</p>
          </>
        )}
      </div>
    </div>
  );
}