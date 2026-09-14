import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
export const trips = sqliteTable(
  "trips",
  {
    id: text("id").primaryKey(),
    owner: text("owner").notNull(),
    createdAt: integer("created_at").notNull(),
    status: text("status").notNull().default("active"),
    version: integer("version").notNull().default(0),
    state: text("state").notNull(),
  },
  (table) => [
    index("idx_trips_owner_created").on(table.owner, table.createdAt),
    uniqueIndex("idx_trips_one_active_owner")
      .on(table.owner)
      .where(sql`${table.status} = 'active'`),
  ],
);
