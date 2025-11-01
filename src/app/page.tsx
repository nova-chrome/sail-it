"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ImageUpload } from "~/features/items/components/image-upload";
import { ItemDetails } from "~/features/items/components/item-details";
import { MarketplaceCopySection } from "~/features/items/components/marketplace-copy-section";
import type { Item } from "~/features/items/types/item";

export default function Home() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [userContext, setUserContext] = useState("");
  const [item, setItem] = useState<Item | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestedContext, setAiSuggestedContext] = useState<string | null>(
    null
  );
  const [isGeneratingContext, setIsGeneratingContext] = useState(false);
  const [showContextSuggestion, setShowContextSuggestion] = useState(false);

  const handleImageUploaded = async (url: string) => {
    setImageUrl(url);
    setError(null);
    setShowContextSuggestion(false);
    setAiSuggestedContext(null);

    // Automatically generate context suggestion
    setIsGeneratingContext(true);
    try {
      const response = await fetch("/api/suggest-context", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: url }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestedContext(data.suggestion);
        setShowContextSuggestion(true);
      }
    } catch (error) {
      console.error("Context suggestion error:", error);
      // Fail silently - user can still add context manually
    } finally {
      setIsGeneratingContext(false);
    }
  };

  const handleAcceptContext = () => {
    if (aiSuggestedContext) {
      setUserContext(aiSuggestedContext);
      setShowContextSuggestion(false);
    }
  };

  const handleRejectContext = () => {
    setShowContextSuggestion(false);
    setAiSuggestedContext(null);
  };

  const handleAnalyze = async () => {
    if (!imageUrl) {
      setError("Please upload an image first");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl,
          userContext: userContext || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze image");
      }

      const data = await response.json();
      setItem(data);
    } catch (error) {
      console.error("Analysis error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to analyze image. Please try again.";
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImageUrl(null);
    setUserContext("");
    setItem(null);
    setError(null);
    setAiSuggestedContext(null);
    setShowContextSuggestion(false);
    setIsGeneratingContext(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Sail It</h1>
          <p className="text-muted-foreground">
            Upload a photo of your item and get AI-generated listing details
            ready for marketplaces
          </p>
        </div>

        <Tabs defaultValue="simple" className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="simple">Simple Mode</TabsTrigger>
            <TabsTrigger value="chat">Chat Mode</TabsTrigger>
          </TabsList>
          <TabsContent value="simple" className="mt-6">
            {!item ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Step 1: Upload Item Photo</CardTitle>
                    <CardDescription>
                      Take or upload a clear photo of the item you want to sell
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageUpload
                      onImageUploaded={handleImageUploaded}
                      currentImageUrl={imageUrl || undefined}
                    />
                  </CardContent>
                </Card>

                {imageUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Step 2: Add Context (Optional)</CardTitle>
                      <CardDescription>
                        Provide additional information about the item to help AI
                        generate better listings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {isGeneratingContext && (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground p-4 bg-muted/50 rounded-md">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          AI is analyzing your image to suggest context...
                        </div>
                      )}

                      {showContextSuggestion && aiSuggestedContext && (
                        <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                          <div>
                            <Label className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                              AI Suggested Context
                            </Label>
                            <p className="mt-2 text-sm text-blue-800 dark:text-blue-200">
                              {aiSuggestedContext}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleAcceptContext}
                              size="sm"
                              variant="default"
                            >
                              Accept & Use This
                            </Button>
                            <Button
                              onClick={handleRejectContext}
                              size="sm"
                              variant="outline"
                            >
                              No Thanks
                            </Button>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="user-context">
                          Additional Context (e.g., condition, brand, year
                          purchased, etc.)
                        </Label>
                        <Textarea
                          id="user-context"
                          placeholder="Example: This is a vintage 1980s bicycle in excellent condition. Only used a few times. Original owner."
                          value={userContext}
                          onChange={(e) => setUserContext(e.target.value)}
                          className="mt-2"
                          rows={4}
                        />
                      </div>
                      {error && (
                        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                          {error}
                        </div>
                      )}
                      <Button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="w-full"
                        size="lg"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Analyzing image...
                          </>
                        ) : (
                          "Generate Listing Details"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Listing Details</h2>
                  <Button variant="outline" onClick={handleReset}>
                    Analyze Another Item
                  </Button>
                </div>

                <ItemDetails item={item} />
                <MarketplaceCopySection item={item} />
              </div>
            )}
          </TabsContent>
          <TabsContent value="chat" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Chat Mode</CardTitle>
                <CardDescription>
                  Coming soon - Chat with AI about your listing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  This feature is currently under development.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
