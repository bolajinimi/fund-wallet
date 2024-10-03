import shortUUID from "short-uuid";
import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY } from "../config/config";

const shortUUIDInstance = shortUUID("0123456789");

export const generateAcctNo = () => {
  return shortUUIDInstance.generate().slice(0, 10);
};

export const generateJwtToken = async (_id: string | object | Buffer) => {
  try {
    return jwt.sign({ _id }, JWT_SECRET_KEY, { expiresIn: "1d" });
  } catch (error) {
    console.log(error);
  }
};

export const validateToken = async (req: Request | any) => {
  try {
    const signature = await req.get("Authorization");
    const payload = jwt.verify(signature.split(" ")[1], JWT_SECRET_KEY);
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};
