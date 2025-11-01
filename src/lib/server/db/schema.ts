import {
  numeric,
  pgTableCreator,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { customAlphabet } from "nanoid";

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789");

// This is a prefix for all tables in the database
// The database is shared with other projects, so we need to prefix the tables to avoid conflicts
export const pgTable = pgTableCreator((name) => `sail_it_${name}`);

export const items = pgTable("items", {
  id: varchar("id", { length: 21 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  imageUrl: text("image_url").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category"),
  condition: text("condition"),
  brand: text("brand"),
  size: text("size"),
  color: text("color"),
  material: text("material"),
  keywords: text("keywords"),
  estimatedOriginalPrice: numeric("estimated_original_price", {
    precision: 10,
    scale: 2,
  }),
  listingPrice: numeric("listing_price", { precision: 10, scale: 2 }).notNull(),
  pricingRationale: text("pricing_rationale"),
  similarItemsSearchTerms: text("similar_items_search_terms"),
  userContext: text("user_context"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
