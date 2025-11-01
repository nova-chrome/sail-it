import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { listings } from "~/lib/server/db/schema";
import { createTRPCRouter, publicProcedure } from "~/lib/server/trpc/trpc";
import { tryCatch } from "~/utils/try-catch";

const createListingInput = z.object({
  imageUrls: z.array(z.string()).min(1, "At least one image URL is required"),
  additionalContext: z.string().optional(),
});

export const listingsRouter = createTRPCRouter({
  create: publicProcedure
    .input(createListingInput)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await tryCatch(
        ctx.db
          .insert(listings)
          .values({
            imageUrls: input.imageUrls,
            userContext: input.additionalContext || null,
            title: "Processing...",
            description: "AI is analyzing your images...",
          })
          .returning()
      );

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create listing",
          cause: error,
        });
      }

      return data[0];
    }),
});
