ALTER TABLE "sail_it_listings" RENAME COLUMN "image_url" TO "image_urls";--> statement-breakpoint
ALTER TABLE "sail_it_listings" ALTER COLUMN "title" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sail_it_listings" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "sail_it_listings" ALTER COLUMN "listing_price" DROP NOT NULL;