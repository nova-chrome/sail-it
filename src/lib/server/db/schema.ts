import { pgTableCreator } from "drizzle-orm/pg-core";
import { customAlphabet } from "nanoid";

export const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789");

// This is a prefix for all tables in the database
// The database is shared with other projects, so we need to prefix the tables to avoid conflicts
export const pgTable = pgTableCreator((name) => `sail_it_${name}`);
