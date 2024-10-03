import mongoose from "mongoose";
import { IAccount } from "../utils/interfaces";

const accountSchema= new mongoose.Schema(
    {
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        acctNo:{ type: String, required:true,unique:true },
        balance: { type: Number, default: 0 },
    },
  {
    timestamps: true,
  }
)


export const accountModel=mongoose.model<IAccount>("Account",accountSchema)