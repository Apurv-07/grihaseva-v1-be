import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY, // Click 'View API Keys' above to copy your API secret
});

export const getCloudinarySignature = async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: "employees" },
      process.env.CLOUDINARY_SECRET_KEY
    );

    res.json({
      timestamp,
      signature,
      cloudName: process.env.CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
    console.log("Data sent");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
