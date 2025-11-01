import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load .env.local first (Next.js default), then .env as fallback
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "./src/lib/server/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
