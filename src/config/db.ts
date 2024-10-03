import mongoose from "mongoose";
import { MONGODB_URI, MONGODB_TEST_URI } from "./config";

const uri = process.env.NODE_ENV === "test" ? MONGODB_TEST_URI : MONGODB_URI;

export const dbConnect = () => {
  mongoose.connect(uri).then(() => {
    console.log("db connection established...");
  });
};
