'use client';

import { useState } from 'react';
import { Settings, Clock, Hash, BookOpen, Percent, X } from 'lucide-react';

export interface GameSettingsData {
  rounds: number;
  drawTime: number;
  wordCount: number;
  customWords: string;
  customWordProbability: number;
}

interface GameSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: GameSettingsData) => void;
  initialSettings?: GameSettingsData;
}

const DEFAULT_SETTINGS: GameSettingsData = {
  rounds: 3,
  drawTime: 60,
  wordCount: 3,
  customWords: '',
  customWordProbability: 0,
};

export default function GameSettings({ isOpen, onClose, onSave, initialSettings }: GameSettingsProps) {
  const [settings, setSettings] = useState<GameSettingsData>(initialSettings || DEFAULT_SETTINGS);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const updateSetting = <K extends keyof GameSettingsData>(key: K, value: GameSettingsData[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-zinc-900 rounded-2xl border border-white/10 p-4 md:p-6 max-w-lg w-full shadow-2xl animate-scaleIn max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-fuchsia-400" />
            <h2 className="text-2xl font-bold text-white">Game Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Settings Form */}
        <div className="space-y-6">
          {/* Rounds */}
          <div>
            <label className="flex items-center gap-2 text-sm text-white/70 mb-2">
              <Hash className="w-4 h-4" />
              Number of Rounds
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="10"
                value={settings.rounds}
                onChange={(e) => updateSetting('rounds', parseInt(e.target.value))}
                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
              />
              <span className="text-white font-semibold w-12 text-center bg-white/10 rounded-lg px-3 py-1">
                {settings.rounds}
              </span>
            </div>
            <p className="text-xs text-white/50 mt-1">
              Each player draws once per round
            </p>
          </div>

          {/* Draw Time */}
          <div>
            <label className="flex items-center gap-2 text-sm text-white/70 mb-2">
              <Clock className="w-4 h-4" />
              Draw Time (seconds)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="30"
                max="180"
                step="10"
                value={settings.drawTime}
                onChange={(e) => updateSetting('drawTime', parseInt(e.target.value))}
                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
              <span className="text-white font-semibold w-12 text-center bg-white/10 rounded-lg px-3 py-1">
                {settings.drawTime}s
              </span>
            </div>
            <p className="text-xs text-white/50 mt-1">
              Time limit for each drawing turn. Points decrease every 5 seconds (500 → 50 pts)
            </p>
          </div>

          {/* Word Count */}
          <div>
            <label className="flex items-center gap-2 text-sm text-white/70 mb-2">
              <BookOpen className="w-4 h-4" />
              Word Choices
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="3"
                max="5"
                value={settings.wordCount}
                onChange={(e) => updateSetting('wordCount', parseInt(e.target.value))}
                className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-white font-semibold w-12 text-center bg-white/10 rounded-lg px-3 py-1">
                {settings.wordCount}
              </span>
            </div>
            <p className="text-xs text-white/50 mt-1">
              Number of words to choose from (8 seconds to pick)
            </p>
          </div>

          {/* Custom Words */}
          <div>
            <label className="flex items-center gap-2 text-sm text-white/70 mb-2">
              <BookOpen className="w-4 h-4" />
              Custom Words
            </label>
            <textarea
              value={settings.customWords}
              onChange={(e) => updateSetting('customWords', e.target.value)}
              placeholder="Enter custom words separated by commas (e.g., unicorn, dragon, wizard)"
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-white placeholder:text-white/40 outline-none focus:border-fuchsia-400 transition resize-none"
              rows={3}
            />
            <p className="text-xs text-white/50 mt-1">
              Add your own words to the game
            </p>
          </div>

          {/* Custom Word Probability */}
          {settings.customWords.trim() && (
            <div>
              <label className="flex items-center gap-2 text-sm text-white/70 mb-2">
                <Percent className="w-4 h-4" />
                Custom Word Probability
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={settings.customWordProbability}
                  onChange={(e) => updateSetting('customWordProbability', parseInt(e.target.value))}
                  className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-white font-semibold w-12 text-center bg-white/10 rounded-lg px-3 py-1">
                  {settings.customWordProbability}%
                </span>
              </div>
              <div className="flex justify-between text-xs text-white/50 mt-1">
                <span>Server words only</span>
                <span>50/50 mix</span>
                <span>Custom only</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
