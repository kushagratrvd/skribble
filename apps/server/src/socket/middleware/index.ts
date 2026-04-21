import type { Socket } from 'socket.io';

export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void
): void {
  // For this app, we don't require authentication
  // but we can validate basic connection params
  const { playerName } = socket.handshake.auth as { playerName?: string };

  // Allow connection even without playerName (they'll provide it when joining)
  next();
}