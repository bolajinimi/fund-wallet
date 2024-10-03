import { Request, Response } from "express";
import { userModel } from "../model/userModel";
import bcrypt from "bcryptjs";
import { generateJwtToken } from "../utils/util";

export const signUp = async (req: Request, res: Response) => {
  try {
    const { email, password, confirm_password } = req.body;
    if (password !== confirm_password) {
      return res
        .status(400)
        .json({ message: "password and confirm_password does not match" });
    }
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists, kindly signin" });
    }
    const password_hash = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      email,
      password_hash,
    });

    const user = await newUser.save();

    return res.status(201).json({ message: "Signup Successful", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ Error: "Internal Server Error" });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const existingUser = await userModel.findOne({ email });
    if (!existingUser) {
      return res
        .status(400)
        .json({ message: "User does not exist, kindly sign up." });
    }
    const validPassword = await bcrypt.compare(
      password,
      existingUser.password_hash
    );
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = await generateJwtToken(existingUser._id);

    return res
      .status(200)
      .json({ message: "SignIn Successful", token, existingUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ Error: "Internal Server Error" });
  }
};
