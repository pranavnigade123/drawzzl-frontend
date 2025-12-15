# 🎨 Drawzzl Frontend

<div align="center">

**Real-time multiplayer drawing and guessing game built with Next.js**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-green?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[🎮 Play Live](https://drawzzl-frontend.vercel.app) • [📖 Documentation](#documentation) • [🚀 Deploy](#deployment)

</div>

---

## ⚠️ Disclaimer

> **Educational & Portfolio Project**
> 
> This project is created purely for **educational purposes** and **skill demonstration**. We are inspired by games like Skribbl.io and similar drawing/guessing games, but this is **not intended to compete with or harm any existing games or services**. 
>
> This is a **learning project** built to:
> - Showcase full-stack development skills
> - Explore real-time web technologies
> - Practice modern web development frameworks
> - Build a portfolio piece for educational purposes
>
> We have great respect for the original creators of drawing games and acknowledge their innovation in this space. This project is built from scratch as a technical exercise and learning opportunity.

---

## ✨ Features

### 🎯 **Core Gameplay**
- **Real-time Drawing** - Smooth canvas with multiple brush tools and colors
- **Live Guessing** - Instant chat-based guessing with smart word validation
- **Turn-based Rounds** - Automatic drawer rotation with customizable round counts
- **Scoring System** - Time-based points with bonus rewards for quick guesses

### 🎨 **Interactive Elements**
- **Custom Avatars** - Personalized player avatars with multiple customization options
- **Dynamic Canvas** - Professional drawing tools with eraser, brush sizes, and color palette
- **Real-time Chat** - Integrated chat system with profanity filtering
- **Word Hints** - Progressive letter reveals to help guessers

### 🏆 **Game Management**
- **Room System** - Create private rooms with shareable codes
- **Player Management** - Host controls with settings customization
- **Game Settings** - Configurable rounds, time limits, and custom word lists
- **Results Display** - Beautiful round and final results with score tracking

### 📱 **User Experience**
- **Responsive Design** - Seamless experience across desktop, tablet, and mobile
- **Connection Status** - Real-time connection monitoring with visual indicators
- **Touch Optimized** - Mobile-friendly drawing with gesture prevention
- **Accessibility** - Screen reader friendly with proper ARIA labels

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Drawzzl Backend** running (see [backend repository](https://github.com/pranavnigade123/drawzzl-backend))


### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/drawzzl-frontend.git
cd drawzzl-frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Backend API URL
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000

# Production optimizations (optional)
NEXT_PUBLIC_USE_PRODUCTION_FIXES=true
```

---

## 🛠️ Development

### Available Scripts

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Type checking
npm run type-check

# Linting
npm run lint

# Linting with auto-fix
npm run lint:fix
```

### Project Structure

```
drawzzl-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Home page
│   ├── components/             # React components
│   │   ├── Canvas.tsx          # Drawing canvas
│   │   ├── Lobby.tsx           # Main game lobby
│   │   ├── GameSettings.tsx    # Game configuration
│   │   ├── AvatarCreator.tsx   # Avatar customization
│   │   └── ...                 # Other components
│   ├── lib/                    # Utilities and configurations
│   │   └── socket.ts           # Socket.IO client setup
│   └── store/                  # State management (if applicable)
├── public/                     # Static assets
│   ├── logo dark bg.png        # App logo
│   └── ...                     # Other assets
├── .env.example               # Environment template
├── next.config.ts             # Next.js configuration
├── tailwind.config.ts         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

---

## 🎮 How to Play

### 1. **Join or Create a Room**
- Click "Create Room" to start a new game
- Or enter a room code to join an existing game
- Customize your avatar and enter your name

### 2. **Game Setup** (Host Only)
- Configure number of rounds (1-10)
- Set drawing time limit (30-180 seconds)
- Add custom words (optional)
- Adjust maximum players (2-15)

### 3. **Drawing Phase**
- When it's your turn, select a word from the choices
- Use the drawing tools to illustrate your word
- Watch the timer and point values decrease over time

### 4. **Guessing Phase**
- Type your guesses in the chat
- Correct guesses earn points based on remaining time
- Watch for hint letters that appear during the round

### 5. **Scoring**
- **Guessers**: Earn 50-500 points based on speed
- **Drawer**: Earn 50 points per correct guesser
- **Winner**: Highest total score after all rounds

---

## 🔧 Technical Details

### Architecture
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom components
- **Real-time**: Socket.IO client for live communication
- **Drawing**: Konva.js for high-performance canvas rendering
- **State**: React hooks with optimized re-rendering

### Key Components

#### **Lobby Component** (`src/components/Lobby.tsx`)
- Main game orchestrator handling all game states
- Socket event management and real-time synchronization
- Player management and room coordination

#### **Canvas Component** (`src/components/Canvas.tsx`)
- High-performance drawing interface using Konva.js
- Touch-optimized for mobile devices
- Real-time drawing synchronization across players

#### **Socket Client** (`src/lib/socket.ts`)
- Configured Socket.IO client with production optimizations
- Automatic reconnection and error handling
- Connection status monitoring

### Performance Optimizations
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component for assets
- **Bundle Analysis**: Webpack bundle analyzer integration
- **Caching**: Aggressive caching for static assets

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
# NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.com
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production

```env
# Production backend URL
NEXT_PUBLIC_SOCKET_URL=https://your-backend.railway.app

# Enable production optimizations
NEXT_PUBLIC_USE_PRODUCTION_FIXES=true
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain component modularity
- Add proper error handling
- Write meaningful commit messages

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Socket.IO** - For real-time communication capabilities
- **Konva.js** - For high-performance canvas rendering
- **Tailwind CSS** - For utility-first CSS framework
- **Vercel** - For seamless deployment platform

---

<div align="center">

**Built with ❤️ by the Drawzzl Team**

[🐛 Report Bug](https://github.com/yourusername/drawzzl-frontend/issues) • [✨ Request Feature](https://github.com/yourusername/drawzzl-frontend/issues) • [💬 Discussions](https://github.com/yourusername/drawzzl-frontend/discussions)

</div>
