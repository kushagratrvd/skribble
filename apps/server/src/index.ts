import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import type { ServerToClientEvents, ClientToServerEvents } from '@skribbl/shared';
import { env } from './config/env.js';
import { registerSocketHandlers } from './socket/index.js';
import { socketAuthMiddleware } from './socket/middleware/index.js';
import roomRoutes from './routes/room.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Express middleware
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());

// REST routes
app.use('/api', roomRoutes);

// Keep-alive ping route (Render trick)
app.get('/api/ping', (req, res) => {
  res.send('pong');
});

// Error handler
app.use(errorHandler);

// Render Keep-Alive Trick
const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
if (RENDER_URL) {
  // Ping our own public URL every 14 minutes to prevent the free tier from sleeping
  setInterval(async () => {
    try {
      const pingUrl = `${RENDER_URL}/api/ping`;
      await fetch(pingUrl);
      console.log(`[Keep-Alive] Pinged ${pingUrl} successfully.`);
    } catch (error: any) {
      console.error(`[Keep-Alive] Failed to ping:`, error.message);
    }
  }, 14 * 60 * 1000);
}

// Socket.IO middleware
io.use(socketAuthMiddleware);

// Register socket handlers
registerSocketHandlers(io);

httpServer.listen(env.PORT, () => {
  console.log(`
  Skribbl Clone Server Running   
  Port: ${env.PORT}              
  Client: ${env.CLIENT_URL}      
  `);
});

export { io };