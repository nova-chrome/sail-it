import { TRPCError } from "@trpc/server";
import { del } from "@vercel/blob";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { listings } from "~/lib/server/db/schema";
import { createTRPCRouter, publicProcedure } from "~/lib/server/trpc/trpc";
import { tryCatch } from "~/utils/try-catch";
import { analyzeListingWithOpenAI } from "./utils/analyze";

const analyzeInput = z.object({
  listingId: z.string(),
  imageUrls: z.array(z.string()).min(1, "At least one image URL is required"),
  userContext: z.string().optional(),
});

const createListingInput = z.object({
  imageUrls: z.array(z.string()).min(1, "At least one image URL is required"),
  additionalContext: z.string().optional(),
});

const idInput = z.object({
  id: z.string(),
});

export const listingsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const { data, error } = await tryCatch(
      ctx.db.select().from(listings).orderBy(desc(listings.createdAt))
    );

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch listings",
        cause: error,
      });
    }

    return data;
  }),
  getById: publicProcedure.input(idInput).query(async ({ ctx, input }) => {
    const { data, error } = await tryCatch(
      ctx.db.select().from(listings).where(eq(listings.id, input.id)).limit(1)
    );

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch listing",
        cause: error,
      });
    }

    const listing = data[0];

    if (!listing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Listing not found",
      });
    }

    return listing;
  }),
  create: publicProcedure
    .input(createListingInput)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await tryCatch(
        ctx.db
          .insert(listings)
          .values({
            imageUrls: input.imageUrls,
            userContext: input.additionalContext || null,
            status: "pending",
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
  delete: publicProcedure.input(idInput).mutation(async ({ ctx, input }) => {
    const { data, error } = await tryCatch(
      ctx.db.delete(listings).where(eq(listings.id, input.id)).returning()
    );

    if (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete listing",
        cause: error,
      });
    }

    if (data[0].imageUrls.length > 0) {
      const { error: deleteError } = await tryCatch(del(data[0].imageUrls));

      if (deleteError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete images",
          cause: deleteError,
        });
      }
    }
  }),
  analyze: publicProcedure
    .input(analyzeInput)
    .mutation(async ({ ctx, input }) => {
      if (!input.imageUrls || input.imageUrls.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "At least one image URL is required",
        });
      }

      if (!input.listingId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Listing ID is required",
        });
      }

      // Check if listing is already completed
      const { data: existingListing, error: fetchError } = await tryCatch(
        ctx.db
          .select()
          .from(listings)
          .where(eq(listings.id, input.listingId))
          .limit(1)
      );

      if (fetchError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch listing",
          cause: fetchError,
        });
      }

      const listing = existingListing[0];

      if (!listing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      // If already completed, return the existing listing without re-analyzing
      if (listing.status === "completed") {
        return listing;
      }

      // Set status to analyzing
      await ctx.db
        .update(listings)
        .set({
          status: "analyzing",
          updatedAt: new Date(),
        })
        .where(eq(listings.id, input.listingId));

      // Analyze images with OpenAI
      const { data: analysis, error: analysisError } = await tryCatch(
        analyzeListingWithOpenAI(ctx.openai, input.imageUrls, input.userContext)
      );

      if (analysisError) {
        // Set status to failed on error
        await ctx.db
          .update(listings)
          .set({
            status: "failed",
            updatedAt: new Date(),
          })
          .where(eq(listings.id, input.listingId));

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to analyze image",
          cause: analysisError,
        });
      }

      // Update the existing listing with analysis results
      const { data, error } = await tryCatch(
        ctx.db
          .update(listings)
          .set({
            status: "completed",
            title: analysis.title,
            description: analysis.description,
            category: analysis.category,
            condition: analysis.condition,
            brand: analysis.brand,
            size: analysis.size,
            color: analysis.color,
            material: analysis.material,
            keywords: analysis.keywords.join(", "),
            estimatedOriginalPrice:
              analysis.estimatedOriginalPrice?.toString() ?? null,
            listingPrice: analysis.listingPrice.toString(),
            pricingRationale: analysis.pricingRationale,
            similarItemsSearchTerms:
              analysis.similarItemsSearchTerms.join(", "),
            originalProductLink:
              analysis.productCount === 1 ? analysis.originalProductLink : null,
            similarProductLinks: analysis.similarProductLinks.map((link) =>
              JSON.stringify(link)
            ),
            updatedAt: new Date(),
          })
          .where(eq(listings.id, input.listingId))
          .returning()
      );

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update listing",
          cause: error,
        });
      }

      const updatedListing = data[0];

      if (!updatedListing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Listing not found",
        });
      }

      return updatedListing;
    }),
});
