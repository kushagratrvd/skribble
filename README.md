# 🎨 Skribbl.io Clone ✏️

Welcome to the **Skribbl.io Clone** — an end-to-end, real-time multiplayer drawing and guessing game! 

This project perfectly mimics the core features and aesthetic of the original [skribbl.io](https://skribbl.io/), built from scratch using a modern, scalable full-stack ecosystem.

## 🌟 Features
*   **Real-Time Multiplayer**: Seamless, instantaneous drawing synchronization utilizing **Socket.IO** with low latency.
*   **Turn-based Logic**: Fluid rotation between the Drawer and Guessers across customizable rounds.
*   **Word Selection System**: The Drawer is presented with 3 curated (or custom-loaded) words to choose from. Guessers receive carefully timed dynamic letter hints!
*   **Rich Game Lobby**: Players can create Private rooms with custom settings, or dive straight in by joining Public matches from the dynamic multiplayer server browser.
*   **Host Moderation**: As a room's host, wield full control allowing you to customize game rules and kick unruly players gracefully.
*   **Persistent Global Leaderboard**: Every finished match permanently records the winner's points to a global PostgreSQL "Hall of Fame" recognizing the top players of all time.
*   **Player Avatars**: Generate billions of combinations of cute visual avatars synced across the lobby, player list, and game.

## 🛠 Tech Stack

This project is meticulously organized as a unified **Turborepo** monorepo workspace for effortless dependency management.

### Frontend (`apps/web`)
*   **React + TypeScript**: Built rapidly on top of [Vite](https://vitejs.dev/) for a lightning-fast developer experience.
*   **Tailwind CSS**: Pixel-perfect responsive styling tailored explicitly to replicate the original game's aesthetic.
*   **Zustand**: Clean, centralized client-state management keeping socket streams completely separate from view logic.
*   **Socket.io-client**: The bridge to the real-time drawing and chat pipelines.

### Backend (`apps/server`)
*   **Node.js & Express**: A lightweight, robust HTTP engine.
*   **Socket.IO Server**: Advanced connection management, broadcasting, tracking, and object-oriented Game State architecture.
*   **Drizzle ORM & Postgres (Neon.tech)**: Serverless, highly-scalable storage to track lifetime game history securely.

## 📂 Project Structure

```
skribbl-clone/
├── apps/
│   ├── server/       # Backend (Express / Socket.IO) logic & Databases
│   └── web/          # Frontend (Vite / React) User Interface
├── packages/
│   └── shared/       # Shared TypeScript constants, Socket events, and schemas
└── package.json      # Monorepo setup leveraging `pnpm` workspaces
```

## 🚀 Getting Started

To run this complete multiplayer system locally, follow these steps:

### 1. Prerequisites 
- Ensure you have **Node.js** (v18+) and **pnpm** installed globally.
- You must create a Free PostgreSQL database on a provider like [Neon](https://neon.tech/) to log the leaderboards.

### 2. Environment Setup
Inside the `apps/server` directory, create a `.env` file containing your config:
```env
PORT=3001
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgresql://your_db_user:password@endpoint-pooler.neon.tech/neondb?sslmode=require
```

Inside the `apps/web` directory, create a `.env` file for the frontend:
```env
VITE_SERVER_URL=http://localhost:3001
```

### 3. Install & Start
Run these commands from the **root directory** of the project:

```bash
# 1. Install all monorepo dependencies instantly
pnpm install

# 2. Push the schema to your fresh database
pnpm run db:push

# 3. Fire up both the Frontend and Backend simultaneously!
pnpm dev
```
Navigate to `http://localhost:5173` in your browser. Jump in, draw, and dominate the leaderboard!