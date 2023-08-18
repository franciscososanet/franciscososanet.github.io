import { config } from "dotenv";
config();

export const PORT = 4000;
export const HOST = `http://localhost:${PORT}`;

export const PAYPAL_API_SECRET = process.env.PAYPAL_API_SECRET;

export const MONGO_URI = process.env.MONGO_URI;

export const MAIL_HOST = process.env.MAIL_HOST;
export const MAIL_PORT = process.env.MAIL_PORT;
export const MAIL_USER = process.env.MAIL_USER;
export const MAIL_NICKNAME = process.env.MAIL_NICKNAME;
export const MAIL_PASS = process.env.MAIL_PASS;