import { pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";

export const links = pgTable(
  "links",
  {
    id: uuid().defaultRandom().primaryKey(),
    owner: text().notNull(),
    slug: text().notNull().unique(),
    target_url: text().notNull(),
    title: text(),
    is_active: boolean().notNull().default(true),
    created_at: timestamp({ withTimezone: true, mode: "string" }).notNull().defaultNow(),
  },
  (table) => [index("links_owner_idx").on(table.owner)],
);

export const clicks = pgTable(
  "clicks",
  {
    id: uuid().defaultRandom().primaryKey(),
    link_id: uuid()
      .notNull()
      .references(() => links.id, { onDelete: "cascade" }),
    created_at: timestamp({ withTimezone: true, mode: "string" }).notNull().defaultNow(),
    device: text(),
    referrer: text(),
    country: text(),
  },
  (table) => [index("clicks_link_idx").on(table.link_id)],
);
