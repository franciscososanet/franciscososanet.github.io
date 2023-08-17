import { config } from "dotenv";
config();

export const PORT = 4000;
export const HOST = `http://localhost:${PORT}`;

export const PAYPAL_API_SECRET = process.env.PAYPAL_API_SECRET;

export const MONGO_URI = process.env.MONGO_URI;