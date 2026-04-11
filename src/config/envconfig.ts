import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export const config = {
  serverPort: process.env.SERVER_PORT,
  serverHost: process.env.SERVER_HOST,
  serverURL: process.env.SERVER_URL ,
};

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL;
