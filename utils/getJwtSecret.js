import dotenv from "dotenv";
dotenv.config();


//convert secret into unit8array

export const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);