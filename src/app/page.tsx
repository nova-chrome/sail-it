"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { UploadCard } from "~/features/simple/components/upload-card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Sail It</h1>
          <p className="text-muted-foreground">
            Upload a photo of your item and get AI-generated listing details
            ready for marketplaces
          </p>
        </div>

        <Tabs defaultValue="simple" className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
            <TabsTrigger value="simple">Simple Mode</TabsTrigger>
            <TabsTrigger value="chat">Chat Mode</TabsTrigger>
          </TabsList>
          <TabsContent value="simple" className="mt-6">
            <UploadCard />
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
