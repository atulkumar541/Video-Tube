import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: "learning-atulkumar541",
  api_key: "555897263683224",
  api_secret: "lcDeltNzvgTzkETNei-mzhWq1fo",
});

const uploadOnCloudinary = async (localFilePath) => {
  if (!localFilePath) {
    console.error("No file path provided.");
    return null;
  }

  // console.log("localFilePath:", localFilePath);

  try {
    // Check if file exists
    if (!fs.existsSync(localFilePath)) {
      console.error("File does not exist:", localFilePath);
      return null;
    }

    // Upload to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // console.log("File has been uploaded successfully:", response.url);

    fs.unlinkSync(localFilePath); // Delete local file
    return response;
  } catch (error) {
    console.error("Upload failed:", error);
    try {
      fs.unlinkSync(localFilePath); // Attempt to delete local file
      console.log("Local file deleted.");
    } catch (unlinkError) {
      console.error("Failed to delete local file:", unlinkError);
    }
    return null;
  }
};

export { uploadOnCloudinary };
