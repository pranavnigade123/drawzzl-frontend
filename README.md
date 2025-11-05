
# Drawzzl – Frontend  
**A real-time multiplayer drawing & guessing game (Skribbl.io clone)**

![Drawzzl](https://via.placeholder.com/1200x600.png?text=Drawzzl+Game+Preview)  
*Create room → Draw → Guess → Celebrate!*

---

## Features

| Feature | Status |
|-------|--------|
| Create / Join rooms with 6-digit code | Done |
| Real-time drawing with `react-konva` | Done |
| Guess word or chat (drawer sees word) | Done |
| 60-second timer + round counter | Done |
| Word hints (`_ _ _ _`) for guessers | Done |
| Confetti on correct guess | Done |
| Animated final leaderboard modal | Done |
| Mobile-first responsive layout | Done |
| Client-only lobby (no hydration errors) | Done |
| Zustand state management | Done |
| Socket.io real-time sync | Done |

---

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS + Lucide Icons
- **Drawing**: `react-konva`
- **State**: `zustand`
- **Realtime**: `socket.io-client`
- **Animations**: `framer-motion`
- **Effects**: `react-confetti`
- **Deploy**: Vercel

---

## Project Structure

```
src/
├── app/
│   └── page.tsx                # Entry: <LobbyContainer />
├── components/
│   ├── lobby/
│   │   ├── LobbyContainer.tsx  # Main orchestrator
│   │   ├── ClientOnlyLobby.tsx # Create/Join UI (client-only)
│   │   ├── CreateRoom.tsx
│   │   ├── JoinRoom.tsx
│   │   └── RoomCard.tsx
│   └── game/
│       ├── Canvas.tsx          # Drawing board
│       ├── ChatBox.tsx
│       ├── Timer.tsx
│       ├── WordHint.tsx
│       ├── ConfettiEffect.tsx
│       └── FinalLeaderboard.tsx
├── store/
│   └── useGameStore.ts         # Zustand global state
├── lib/
│   └── socket.ts               # Socket.io connection
└── public/
    └── favicon.ico
```

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/pranavnigade123/drawzzl-frontend.git
cd drawzzl-frontend
npm install
```

### 2. Environment

Create `.env.local` in root:

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### 3. Run Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Game Flow

1. **Create** or **Join** a room
2. Wait for 2+ players → **Start Game** (creator)
3. **Drawer** sees word → draws
4. Others **guess** in chat
5. Correct guess → **+points + confetti**
6. Round ends → next drawer
7. After all rounds → **Final Leaderboard**
8. **Play Again**

---

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run start      # Run built app
npm run lint       # ESLint check
```

---

## Backend Required

This frontend connects to:  
[https://github.com/pranavnigade123/drawzzl-backend](https://github.com/pranavnigade123/drawzzl-backend)

> Run backend on `http://localhost:3001`

---

## Deployment

### Vercel (Recommended)

```bash
vercel
```

Or connect repo → auto-deploy on push.

---

## Contributing

1. Fork & clone
2. Create branch: `feat/awesome-thing`
3. Commit with **Conventional Commits**
4. Open PR with description

---

## License

MIT © Pranav Nigade

---

**Made with love, coffee, and a lot of drawing** ✍️
```
