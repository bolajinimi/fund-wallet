import dotenv from "dotenv"
dotenv.config()


export const PORT = process.env.NODE_ENV === "test" ? 3005: Number(process.env.PORT)
export const MONGODB_URI = process.env.MONGODB_URI as string;
export const MONGODB_TEST_URI = process.env.MONGODB_TEST_URI as string;
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string;