'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Sparkles } from 'lucide-react';
import { socket } from '@/lib/socket';
import Button from '@/components/ui/Button';

interface WordSelectionProps {
  words: string[];
  timeLimit: number;
  roomId: string;
  onSelect: (word: string) => void;
}

export default function WordSelection({
  words,
  timeLimit,
  roomId,
  onSelect,
}: WordSelectionProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-select first word if time runs out
          if (!selected) {
            handleSelect(words[0]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [words, selected]);

  const handleSelect = (word: string) => {
    if (selected) return; // Already selected
    setSelected(word);
    socket.emit('selectWord', { roomId, word });
    onSelect(word);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 rounded-3xl p-8 max-w-2xl w-full border border-white/20 shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Sparkles className="w-16 h-16 mx-auto text-yellow-400 mb-4" />
            <h2 className="text-3xl font-bold text-white mb-2">
              Choose Your Word!
            </h2>
            <p className="text-white/70">Pick a word to draw</p>
          </div>

          {/* Timer */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <Clock
              className={`w-5 h-5 ${timeLeft <= 3 ? 'text-red-400' : 'text-white/70'}`}
            />
            <span
              className={`text-2xl font-bold tabular-nums ${
                timeLeft <= 3 ? 'text-red-400 animate-pulse' : 'text-white'
              }`}
            >
              {timeLeft}s
            </span>
          </div>

          {/* Word Choices */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            {words.map((word, index) => (
              <motion.button
                key={word}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelect(word)}
                disabled={!!selected}
                className={`p-6 rounded-2xl text-2xl font-bold transition-all duration-200 ${
                  selected === word
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white scale-105 shadow-lg shadow-green-500/50'
                    : selected
                      ? 'bg-white/5 text-white/30 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white hover:scale-105 shadow-lg hover:shadow-purple-500/50'
                }`}
              >
                {word}
              </motion.button>
            ))}
          </div>

          {/* Info */}
          <p className="text-center text-white/50 text-sm">
            {selected
              ? 'Word selected! Get ready to draw...'
              : 'Click on a word to select it'}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
