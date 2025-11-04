"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as z from "zod";
import { ImageFile, ImageUpload } from "~/components/file-upload/image-upload";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "~/components/ui/field";
import { Textarea } from "~/components/ui/textarea";
import { useTRPC } from "~/lib/client/trpc/client";
import { tryCatch } from "~/utils/try-catch";

const formSchema = z.object({
  images: z.array(z.any()).min(1, "At least one image is required"),
  additionalContext: z.string(),
});

export function UploadCard() {
  const router = useRouter();
  const trpc = useTRPC();

  const createListingMutation = useMutation(
    trpc.listings.create.mutationOptions()
  );

  const form = useForm({
    defaultValues: {
      images: [] as ImageFile[],
      additionalContext: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      // Extract image URLs from uploaded images
      const imageUrls = value.images
        .filter((img) => img.url && img.status === "completed")
        .map((img) => img.url!);

      if (imageUrls.length === 0) {
        toast.error("Please wait for images to finish uploading");
        return;
      }

      // Create listing using tRPC mutation
      const { data: listing, error } = await tryCatch(
        createListingMutation.mutateAsync({
          imageUrls,
          additionalContext: value.additionalContext,
        })
      );

      if (error) {
        console.error("Submission error:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to create listing"
        );
        return;
      }

      // Navigate to the listing page
      router.push(`/listings/${listing.id}`);
    },
  });

  return (
    <Card>
      <form
        id="upload-item-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <CardHeader>
          <CardTitle>Upload Listing Photos</CardTitle>
          <CardDescription>
            Take or upload clear photos of the item you want to sell
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <form.Field name="images">
            {(field) => (
              <ImageUpload
                value={field.state.value}
                onImagesChange={(images) => field.handleChange(images)}
              />
            )}
          </form.Field>
          <form.Field name="additionalContext">
            {(field) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Additional Context</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  placeholder="Add any additional details about the item..."
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  rows={6}
                  className="min-h-24 resize-none"
                />
                <FieldDescription>
                  Provide extra information that might help with the listing
                  (optional)
                </FieldDescription>
              </Field>
            )}
          </form.Field>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={createListingMutation.isPending}
          >
            Reset
          </Button>
          <Button
            type="submit"
            form="upload-item-form"
            disabled={createListingMutation.isPending}
          >
            {createListingMutation.isPending
              ? "Creating Listing..."
              : "Start Listing"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
