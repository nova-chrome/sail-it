CREATE TABLE "sail_it_items" (
	"id" varchar(21) PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"estimated_original_price" numeric(10, 2),
	"listing_price" numeric(10, 2) NOT NULL,
	"user_context" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
