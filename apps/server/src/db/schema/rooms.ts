import {
  pgTable,
  text,
  timestamp,
  json,
  varchar,
} from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';
import type { RoomSettings } from '@skribbl/shared';

export const rooms = pgTable('rooms', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid(12)),
  code: varchar('code', { length: 8 }).notNull().unique(),
  hostId: text('host_id').notNull(),
  settings: json('settings').$type<RoomSettings>().notNull(),
  status: varchar('status', { length: 20 }).notNull().default('waiting'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});