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

export type Listing = typeof listings.$inferSelect;
export const listings = pgTable("listings", {
  id: varchar("id", { length: 21 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  imageUrls: text("image_urls").array().notNull(),
  status: text("status")
    .notNull()
    .default("pending")
    .$type<"pending" | "analyzing" | "completed" | "failed">(),
  title: text("title"),
  description: text("description"),
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
  listingPrice: numeric("listing_price", { precision: 10, scale: 2 }),
  pricingRationale: text("pricing_rationale"),
  similarItemsSearchTerms: text("similar_items_search_terms"),
  originalProductLink: text("original_product_link"),
  similarProductLinks: text("similar_product_links").array(),
  userContext: text("user_context"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
