import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    BLOB_READ_WRITE_TOKEN: z.string().min(1),
    DATABASE_URL: z.url(),
    OPEN_AI_API_KEY: z.string().min(1),
    TAVILY_API_KEY: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_API_URL: z.string().min(1),
  },
  // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
  runtimeEnv: {
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    DATABASE_URL: process.env.DATABASE_URL,
    OPEN_AI_API_KEY: process.env.OPEN_AI_API_KEY,
    TAVILY_API_KEY: process.env.TAVILY_API_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  // experimental__runtimeEnv: {
  //   NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
  // }
});
