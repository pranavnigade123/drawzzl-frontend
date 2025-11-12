import { create } from 'zustand';
import { socket } from '@/lib/socket';

export interface Player {
  id: string;
  name: string;
  score: number;
  isDrawer?: boolean;
}

export interface ChatItem {
  id: string;
  name: string;
  msg: string;
}

export interface GameState {
  // Room
  roomId: string | null;
  isCreator: boolean;
  players: Player[];
  gameStarted: boolean;
  gameEnded: boolean;

  // Turn
  currentWord: string | undefined;
  wordHint: string;
  timeLeft: number;
  round: number;
  maxRounds: number;

  // Chat
  chat: ChatItem[];

  // UI
  confetti: boolean;
  errorMessage: string | null;

  // Actions
  setRoomId: (id: string | null) => void;
  setIsCreator: (is: boolean) => void;
  setPlayers: (players: Player[]) => void;
  setGameStarted: (started: boolean) => void;
  setGameEnded: (ended: boolean) => void;
  setCurrentWord: (word: string | undefined) => void;
  setWordHint: (hint: string) => void;
  setTimeLeft: (time: number) => void;
  setRound: (round: number) => void;
  setMaxRounds: (rounds: number) => void;
  addChat: (item: ChatItem) => void;
  clearChat: () => void;
  setConfetti: (show: boolean) => void;
  setErrorMessage: (msg: string | null) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  roomId: null,
  isCreator: false,
  players: [],
  gameStarted: false,
  gameEnded: false,
  currentWord: undefined,
  wordHint: '',
  timeLeft: 0,
  round: 1,
  maxRounds: 3,
  chat: [],
  confetti: false,
  errorMessage: null,

  setRoomId: (id) => set({ roomId: id }),
  setIsCreator: (is) => set({ isCreator: is }),
  setPlayers: (players) => set({ players }),
  setGameStarted: (started) => set({ gameStarted: started }),
  setGameEnded: (ended) => set({ gameEnded: ended }),
  setCurrentWord: (word) => set({ currentWord: word }),
  setWordHint: (hint) => set({ wordHint: hint }),
  setTimeLeft: (time) => set({ timeLeft: time }),
  setRound: (round) => set({ round }),
  setMaxRounds: (rounds) => set({ maxRounds: rounds }),
  addChat: (item) => set((state) => ({ chat: [...state.chat, item] })),
  clearChat: () => set({ chat: [] }),
  setConfetti: (show) => set({ confetti: show }),
  setErrorMessage: (msg) => set({ errorMessage: msg }),
  reset: () =>
    set({
      roomId: null,
      isCreator: false,
      players: [],
      gameStarted: false,
      gameEnded: false,
      currentWord: undefined,
      wordHint: '',
      timeLeft: 0,
      round: 1,
      maxRounds: 3,
      chat: [],
      confetti: false,
      errorMessage: null,
    }),
}));