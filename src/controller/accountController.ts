import { Request, Response } from "express";
import { accountModel } from "../model/accountModel";
import { generateAcctNo } from "../utils/util";

export const createAccount = async (req: Request | any, res: Response) => {
  try {
    const { _id } = req.user;

    const existingAccount = await accountModel.findOne({ user_id: _id });
    if (existingAccount) {
      return res.status(400).json({ message: "Account already created." });
    }
    const newAccount = new accountModel({
      user_id: _id,
      acctNo: generateAcctNo(),
    });

    const acct = await newAccount.save();
    return res
      .status(201)
      .json({ message: "Account created successfully", acct });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ Error: "Internal Server Error" });
  }
};

export const getAccount = async (req: Request | any, res: Response) => {
  try {
    const { _id } = req.user;

    const account = await accountModel.findOne({ user_id: _id });

    return res
      .status(200)
      .json({ message: "Accounts retrieved successfully", account });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ Error: "Internal Server Error" });
  }
};

export const fundAccount = async (req: Request | any, res: Response) => {
  try {
    const { _id } = req.user;
    const { amount } = req.body;
    const amountInNumber = parseInt(amount);

    const existingAccount = await accountModel.findOne({ user_id: _id });

    if (!existingAccount) {
      return res
        .status(400)
        .json({ message: "Kindly create an account before funding." });
    }

    existingAccount.balance += amountInNumber;

    const account = await existingAccount.save();

    return res
      .status(200)
      .json({ message: "Account funded successfully", account });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ Error: "Internal Server Error" });
  }
};

export const transferFund = async (req: Request | any, res: Response) => {
  try {
    const { _id } = req.user;
    const { recieverAcctNo, amount } = req.body;
    const senderAccount = await accountModel.findOne({ user_id: _id });
    if (!senderAccount) {
      return res.status(400).json({ message: "Kindly create an account." });
    }

    if (senderAccount.balance < +amount) {
      return res.status(400).json({ message: "Insufficient fund." });
    }
    const recieverAccount = await accountModel.findOne({
      acctNo: recieverAcctNo,
    });

    if (!recieverAccount) {
      return res.status(400).json({ message: "Invalid Account number." });
    }
    const senderAccount_No = senderAccount.acctNo;
    senderAccount.balance -= parseInt(amount);
    recieverAccount.balance += parseInt(amount);
    const recieverAccount_No = recieverAccount.acctNo;
    await senderAccount.save();
    await recieverAccount.save();

    return res
      .status(200)
      .json({
        message: "Transfer successful",
        senderAccount_No,
        recieverAccount_No,
        amount,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ Error: "Internal Server Error" });
  }
};

export const withdrawFund = async (req: Request | any, res: Response) => {
  try {
    const { _id } = req.user;
    const { amount } = req.body;
    const amountInNumber = parseInt(amount);

    const existingAccount = await accountModel.findOne({ user_id: _id });

    if (!existingAccount) {
      return res
        .status(400)
        .json({ message: "Kindly create an account before making withdraw." });
    }
    if (existingAccount.balance < amountInNumber) {
      return res.status(400).json({ message: "Insufficient fund." });
    }
    existingAccount.balance -= amountInNumber;
    const account = await existingAccount.save();

    return res
      .status(200)
      .json({ message: "Withdrawal successfully", account });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ Error: "Internal Server Error" });
  }
};
