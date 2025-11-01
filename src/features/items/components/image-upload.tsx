"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

type ImageUploadProps = {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
};

export function ImageUpload({
  onImageUploaded,
  currentImageUrl,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      onImageUploaded(data.url);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="image-upload">Upload Item Photo</Label>
      <div className="flex flex-col gap-4">
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileSelect}
          disabled={isUploading}
          className="cursor-pointer"
        />
        {preview && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden border">
            <Image
              src={preview}
              alt="Item preview"
              fill
              className="object-contain"
            />
          </div>
        )}
        {isUploading && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading image...
          </div>
        )}
      </div>
    </div>
  );
}
