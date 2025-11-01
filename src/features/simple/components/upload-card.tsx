import ImageUpload from "~/components/file-upload/image-upload";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export function UploadCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Item Photo</CardTitle>
        <CardDescription>
          Take or upload clear photos of the item you want to sell
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ImageUpload onImagesChange={() => {}} />
      </CardContent>
    </Card>
  );
}
