'use client';

import { useGameStore } from '@/store/useGameStore';
import { socket } from '@/lib/socket';
import { Eye, EyeOff, Sparkles, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WordHint() {
  const { currentWord, wordHint, players } = useGameStore();

  const me = players.find((p) => p.id === socket.id);
  const isDrawer = me?.isDrawer;

  if (!isDrawer && !wordHint) return null;

  // Count revealed letters
  const revealedCount = wordHint.split('').filter((c) => c !== '_' && c !== ' ').length;
  const totalLetters = wordHint.replace(/\s/g, '').length;

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-xl border-2 px-4 py-2.5 text-sm font-bold shadow-lg backdrop-blur-sm transition-all ${
        isDrawer
          ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/50 text-amber-100'
          : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/50 text-cyan-100'
      }`}
    >
      {isDrawer ? (
        <>
          <Sparkles className="h-5 w-5 text-amber-300" />
          <span className="text-lg">
            Your word:{' '}
            <span className="underline font-black">{currentWord}</span>
          </span>
        </>
      ) : (
        <>
          <Lightbulb className="h-5 w-5 text-cyan-300" />
          <div className="flex items-center gap-2">
            <span className="text-lg tracking-widest font-mono">
              {wordHint.split('').map((char, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={char === '_' ? 'text-cyan-300/50' : 'text-cyan-100'}
                >
                  {char}
                </motion.span>
              ))}
            </span>
            {revealedCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs text-cyan-300/70 ml-2"
              >
                ({revealedCount}/{totalLetters})
              </motion.span>
            )}
          </div>
        </>
      )}
    </div>
  );
}