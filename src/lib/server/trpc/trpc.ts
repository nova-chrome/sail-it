import { initTRPC } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";
import { db } from "../db/drizzle";

export type TrpcContext = Awaited<ReturnType<typeof createTRPCContext>>;

export const createTRPCContext = cache(async () => {
  return {
    db,
  };
});

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
