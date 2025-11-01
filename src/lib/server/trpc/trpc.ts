import { createOpenAI } from "@ai-sdk/openai";
import { initTRPC } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { env } from "~/env";
import { db } from "../db/drizzle";

const openai = createOpenAI({
  apiKey: env.OPEN_AI_API_KEY,
});

export type TrpcContext = Awaited<ReturnType<typeof createTRPCContext>>;

export const createTRPCContext = cache(async () => {
  return {
    db,
    openai,
  };
});

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
