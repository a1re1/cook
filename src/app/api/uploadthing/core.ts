import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getUser } from "@workos-inc/authkit-nextjs";

const f = createUploadthing();

export const ourFileRouter = {
  recipeImageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 6, // Up to 6 images per recipe
    },
  })
    .middleware(async () => {
      const { user } = await getUser();
      if (!user) throw new Error("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for user:", metadata.userId);
      console.log("File URL:", file.url);

      // Return data to client
      return {
        uploadThingKey: file.key,
        uploadThingUrl: file.url,
        fileName: file.name,
        fileSize: file.size,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
