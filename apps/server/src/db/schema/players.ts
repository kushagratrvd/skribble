import {
  pgTable,
  text,
  integer,
  boolean,
  varchar,
  json,
} from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';
import { rooms } from './rooms.js';
import type { AvatarState } from '@skribbl/shared';

export const players = pgTable('skribbl_players', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(12)),
  socketId: text('socket_id').notNull(),
  name: varchar('name', { length: 30 }).notNull(),
  roomId: text('room_id')
    .notNull()
    .references(() => rooms.id, { onDelete: 'cascade' }),
  score: integer('score').notNull().default(0),
  isDrawing: boolean('is_drawing').notNull().default(false),
  avatar: json('avatar').$type<AvatarState>().notNull().default({ color: 0, eyes: 0, mouth: 0 }),
});