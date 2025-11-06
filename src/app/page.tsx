import { UploadCard } from "~/features/listings/components/upload-card";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Sail It</h1>
        <p className="text-muted-foreground">
          Upload a photo of your item and get AI-generated listing details ready
          for marketplaces
        </p>
      </div>

      <UploadCard />
    </div>
  );
}
