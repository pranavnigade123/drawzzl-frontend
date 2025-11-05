// src/store/useGameStore.ts
import { create } from 'zustand';
import { socket } from '@/lib/socket';

interface Player {
  id: string;
  name: string;
  score: number;
  isDrawer?: boolean;
}

interface GameState {
  // Room
  roomId: string | null;
  isCreator: boolean;
  players: Player[];
  gameStarted: boolean;

  // Turn
  currentWord: string | undefined;
  wordHint: string;
  timeLeft: number;
  round: number;
  maxRounds: number;

  // Chat
  chat: { id: string; name: string; msg: string }[];

  // Actions
  setRoomId: (id: string | null) => void;
  setIsCreator: (is: boolean) => void;
  setPlayers: (players: Player[]) => void;
  setGameStarted: (started: boolean) => void;
  setCurrentWord: (word: string | undefined) => void;
  setWordHint: (hint: string) => void;
  setTimeLeft: (time: number) => void;
  setRound: (round: number) => void;
  setMaxRounds: (rounds: number) => void;
  addChat: (item: { id: string; name: string; msg: string }) => void;
  clearChat: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  roomId: null,
  isCreator: false,
  players: [],
  gameStarted: false,
  currentWord: undefined,
  wordHint: '',
  timeLeft: 0,
  round: 1,
  maxRounds: 3,
  chat: [],

  setRoomId: (id) => set({ roomId: id }),
  setIsCreator: (is) => set({ isCreator: is }),
  setPlayers: (players) => set({ players }),
  setGameStarted: (started) => set({ gameStarted: started }),
  setCurrentWord: (word) => set({ currentWord: word }),
  setWordHint: (hint) => set({ wordHint: hint }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setRound: (round) => set({ round }),
  setMaxRounds: (rounds) => set({ maxRounds: rounds }),
  addChat: (item) => set((state) => ({ chat: [...state.chat, item] })),
  clearChat: () => set({ chat: [] }),
  reset: () =>
    set({
      roomId: null,
      isCreator: false,
      players: [],
      gameStarted: false,
      currentWord: undefined,
      wordHint: '',
      timeLeft: 0,
      round: 1,
      maxRounds: 3,
      chat: [],
    }),
}));