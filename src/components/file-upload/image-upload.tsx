"use client";

import {
  ChevronDown,
  CloudUpload,
  Loader2,
  TriangleAlert,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { cn } from "~/lib/utils";

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
  url?: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}

interface ImageUploadProps {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  className?: string;
  value?: ImageFile[];
  onImagesChange?: (images: ImageFile[]) => void;
  onUploadComplete?: (images: ImageFile[]) => void;
}

export function ImageUpload({
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = "image/*",
  className,
  value,
  onImagesChange,
  onUploadComplete,
}: ImageUploadProps) {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isImagesOpen, setIsImagesOpen] = useState(true);
  const isControlled = value !== undefined;

  // Sync internal state with external value (for controlled mode)
  useEffect(() => {
    if (value !== undefined) {
      setImages(value);
      // Clear errors when value is reset to empty array
      if (value.length === 0) {
        setErrors([]);
      }
    }
  }, [value]);

  // Auto-open collapsible when images are uploading
  useEffect(() => {
    const hasUploadingImages = images.some((img) => img.status === "uploading");
    if (hasUploadingImages) {
      setIsImagesOpen(true);
    }
  }, [images]);

  // Notify parent when all uploads are complete
  useEffect(() => {
    if (
      images.length > 0 &&
      images.every((img) => img.status === "completed")
    ) {
      onUploadComplete?.(images);
    }
  }, [images, onUploadComplete]);

  const validateFile = useCallback(
    (file: File, currentImagesCount: number): string | null => {
      if (!file.type.startsWith("image/")) {
        return "File must be an image";
      }
      if (file.size > maxSize) {
        return `File size must be less than ${(maxSize / 1024 / 1024).toFixed(
          1
        )}MB`;
      }
      if (currentImagesCount >= maxFiles) {
        return `Maximum ${maxFiles} files allowed`;
      }
      return null;
    },
    [maxSize, maxFiles]
  );

  const uploadToBlob = useCallback(
    async (imageFile: ImageFile) => {
      const updateImage = (updater: (img: ImageFile) => ImageFile) => {
        setImages((prev) => {
          const updatedImages = prev.map((img) =>
            img.id === imageFile.id ? updater(img) : img
          );
          // Notify parent in controlled mode after state update
          if (isControlled) {
            queueMicrotask(() => onImagesChange?.(updatedImages));
          }
          return updatedImages;
        });
      };

      try {
        const formData = new FormData();
        formData.append("file", imageFile.file);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            updateImage((img) => ({ ...img, progress }));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            updateImage((img) => ({
              ...img,
              progress: 100,
              status: "completed" as const,
              url: response.url,
            }));
          } else {
            updateImage((img) => ({
              ...img,
              status: "error" as const,
              error: "Upload failed",
            }));
          }
        });

        xhr.addEventListener("error", () => {
          updateImage((img) => ({
            ...img,
            status: "error" as const,
            error: "Network error",
          }));
        });

        xhr.open("POST", "/api/upload");
        xhr.send(formData);
      } catch (error) {
        updateImage((img) => ({
          ...img,
          status: "error" as const,
          error: error instanceof Error ? error.message : "Upload failed",
        }));
      }
    },
    [isControlled, onImagesChange]
  );

  const addImages = useCallback(
    (files: FileList | File[]) => {
      setImages((prev) => {
        const newImages: ImageFile[] = [];
        const newErrors: string[] = [];

        Array.from(files).forEach((file) => {
          const error = validateFile(file, prev.length + newImages.length);
          if (error) {
            newErrors.push(`${file.name}: ${error}`);
            return;
          }

          const imageFile: ImageFile = {
            id: `${Date.now()}-${Math.random()}`,
            file,
            preview: URL.createObjectURL(file),
            progress: 0,
            status: "uploading",
          };

          newImages.push(imageFile);
        });

        if (newErrors.length > 0) {
          setErrors((prevErrors) => [...prevErrors, ...newErrors]);
        }

        if (newImages.length > 0) {
          const updatedImages = [...prev, ...newImages];

          // Notify parent in controlled mode after state update
          if (isControlled) {
            queueMicrotask(() => onImagesChange?.(updatedImages));
          }

          // Upload images to Vercel Blob
          newImages.forEach((imageFile) => {
            uploadToBlob(imageFile);
          });

          return updatedImages;
        }

        return prev;
      });
    },
    [isControlled, onImagesChange, validateFile, uploadToBlob]
  );

  const removeImage = useCallback(
    (id: string) => {
      setImages((prev) => {
        const image = prev.find((img) => img.id === id);
        if (image) {
          URL.revokeObjectURL(image.preview);
        }
        const updatedImages = prev.filter((img) => img.id !== id);

        // Notify parent in controlled mode after state update
        if (isControlled) {
          queueMicrotask(() => onImagesChange?.(updatedImages));
        }

        return updatedImages;
      });
    },
    [isControlled, onImagesChange]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        addImages(files);
      }
    },
    [addImages]
  );

  const openFileDialog = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = accept;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        addImages(target.files);
      }
    };
    input.click();
  }, [accept, addImages]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className={cn("w-full max-w-4xl", className)}>
      {/* Collapsible Image Grid */}
      {images.length > 0 && (
        <Collapsible
          open={isImagesOpen}
          onOpenChange={setIsImagesOpen}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 p-0 h-auto hover:bg-transparent"
              >
                <ChevronDown
                  className={cn(
                    "size-4 transition-transform duration-200",
                    isImagesOpen ? "rotate-0" : "-rotate-90"
                  )}
                />
                <span className="text-sm font-medium">
                  Uploaded Images ({images.length})
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="grid grid-cols-4 gap-2.5">
              {images.map((imageFile, index) => (
                <Card
                  key={imageFile.id}
                  className="aspect-square overflow-hidden rounded-md bg-accent/50 shadow-none shrink-0 relative group p-0"
                >
                  <img
                    src={imageFile.preview}
                    className="w-full h-full object-cover absolute inset-0"
                    alt={`Product view ${index + 1}`}
                  />

                  {/* Loading Overlay */}
                  {imageFile.status === "uploading" && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-20">
                      <Loader2 className="size-8 animate-spin text-primary" />
                    </div>
                  )}

                  {/* Error Overlay */}
                  {imageFile.status === "error" && (
                    <div className="absolute inset-0 bg-destructive/10 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                      <TriangleAlert className="size-8 text-destructive mb-2" />
                      <span className="text-xs font-medium text-destructive">
                        {imageFile.error || "Upload failed"}
                      </span>
                    </div>
                  )}

                  {/* Remove Button Overlay */}
                  <Button
                    onClick={() => removeImage(imageFile.id)}
                    variant="outline"
                    size="icon"
                    className="shadow-sm absolute top-2 right-2 size-6 opacity-0 group-hover:opacity-100 rounded-full z-10"
                  >
                    <XIcon className="size-3.5" />
                  </Button>
                </Card>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Upload Area */}
      <Card
        className={cn(
          "border-dashed shadow-none rounded-md transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <CardContent className="text-center">
          <div className="flex items-center justify-center size-[32px] rounded-full border border-border mx-auto mb-3">
            <CloudUpload className="size-4" />
          </div>
          <h3 className="text-2sm text-foreground font-semibold mb-0.5">
            Choose a file or drag & drop here.
          </h3>
          <span className="text-xs text-secondary-foreground font-normal block mb-3">
            JPEG, PNG, up to {formatBytes(maxSize)}.
          </span>
          <Button size="sm" variant="outline" onClick={openFileDialog}>
            Browse File
          </Button>
        </CardContent>
      </Card>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive" className="mt-5">
          <TriangleAlert />
          <AlertTitle>File upload error(s)</AlertTitle>
          <AlertDescription>
            {errors.map((error, index) => (
              <p key={index} className="last:mb-0">
                {error}
              </p>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
