"use client";

import { useForm } from "@tanstack/react-form";
import * as z from "zod";

const formSchema = z.object({
  images: z.array(z.any()).min(1, "At least one image is required"),
  additionalContext: z.string(),
});

import { ImageFile, ImageUpload } from "~/components/file-upload/image-upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Field, FieldDescription, FieldLabel } from "~/components/ui/field";
import { Textarea } from "~/components/ui/textarea";

export function UploadCard() {
  const form = useForm({
    defaultValues: {
      images: [] as ImageFile[],
      additionalContext: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log(value);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Item Photo</CardTitle>
        <CardDescription>
          Take or upload clear photos of the item you want to sell
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <form
          id="upload-item-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field name="images">
            {(field) => (
              <ImageUpload
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
        </form>
      </CardContent>
    </Card>
  );
}
