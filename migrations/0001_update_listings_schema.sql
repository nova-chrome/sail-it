-- Add new image_urls array column
ALTER TABLE "sail_it_listings" ADD COLUMN "image_urls" text[] NOT NULL DEFAULT '{}';

-- Drop old image_url column
ALTER TABLE "sail_it_listings" DROP COLUMN "image_url";

-- Make title, description, and listing_price nullable
ALTER TABLE "sail_it_listings" ALTER COLUMN "title" DROP NOT NULL;
ALTER TABLE "sail_it_listings" ALTER COLUMN "description" DROP NOT NULL;
ALTER TABLE "sail_it_listings" ALTER COLUMN "listing_price" DROP NOT NULL;

