import { listingsRouter } from "~/features/listings/routes/listings.router";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  listings: listingsRouter,
});

export type AppRouter = typeof appRouter;
