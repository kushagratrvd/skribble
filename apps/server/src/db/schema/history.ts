import {
  pgTable,
  text,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

export const gameHistory = pgTable('game_history', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(12)),
  roomCode: text('room_code').notNull(),
  winnerName: text('winner_name').notNull(),
  winnerScore: integer('winner_score').notNull(),
  totalPlayers: integer('total_players').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const leaderboard = pgTable('leaderboard', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(12)),
  playerName: text('player_name').notNull().unique(),
  totalWins: integer('total_wins').notNull().default(0),
  totalScore: integer('total_score').notNull().default(0),
  gamesPlayed: integer('games_played').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
