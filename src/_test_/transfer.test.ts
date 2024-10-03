import request from "supertest";
import app from "../index";
import mongoose from "mongoose";

import { generateAcctNo, generateJwtToken } from "../utils/util";
import { userModel } from "../model/userModel";
import { accountModel } from "../model/accountModel";

describe("POST /api/account/transfer", () => {
  let senderUser: any;
  let receiverUser: any;
  let senderToken: string;

  beforeEach(async () => {
    senderUser = new userModel();
    receiverUser = new userModel();

    senderToken = (await generateJwtToken(senderUser._id)) as string;
  });

  afterEach(async () => {
    app.close();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  it("should return 401 if user is not logged in", async () => {
    const response = await request(app).post("/api/account/transfer");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Not Authorized");
  });

  it("should transfer funds successfully", async () => {
    // Create accounts for sender and receiver
    const senderAccount = new accountModel({
      user_id: senderUser._id,
      acctNo: generateAcctNo(),
      balance: 1000,
    });
    const receiverAccount = new accountModel({
      user_id: receiverUser._id,
      acctNo: generateAcctNo(),
    });

    await senderAccount.save();
    await receiverAccount.save();

    const response = await request(app)
      .post("/api/account/transfer")
      .set("Authorization", `Bearer ${senderToken}`)
      .send({
        recieverAcctNo: receiverAccount.acctNo,
        amount: 500,
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Transfer successful");
    expect(response.body.senderAccount_No).toBe(senderAccount.acctNo);
    expect(response.body.recieverAccount_No).toBe(receiverAccount.acctNo);
    expect(response.body.amount).toBe(500);

    const updatedSenderAccount = await accountModel.findOne({
      user_id: senderUser._id,
    });
    const updatedReceiverAccount = await accountModel.findOne({
      user_id: receiverUser._id,
    });

    expect(updatedSenderAccount?.balance).toBe(500);
    expect(updatedReceiverAccount?.balance).toBe(500);
  });
  it("should return 400 if sender does not have account", async () => {
    const response = await request(app)
      .post("/api/account/transfer")
      .set("Authorization", `Bearer ${senderToken}`)
      .send({
        recieverAcctNo: "receiverAccountNumber",
        amount: 1500,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Kindly create an account.");
  });
  it("should return 400 if sender has insufficient funds", async () => {
    const senderAccount = new accountModel({
      user_id: senderUser._id,
      acctNo: generateAcctNo(),
      balance: 1000,
    });
    await senderAccount.save();
    const response = await request(app)
      .post("/api/account/transfer")
      .set("Authorization", `Bearer ${senderToken}`)
      .send({
        recieverAcctNo: "receiverAccountNumber",
        amount: 1500,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Insufficient fund.");
  });

  it("should return 400 if receiver account does not exist", async () => {
    const senderAccount = new accountModel({
      user_id: senderUser._id,
      acctNo: generateAcctNo(),
      balance: 1000,
    });
    await senderAccount.save();
    const response = await request(app)
      .post("/api/account/transfer")
      .set("Authorization", `Bearer ${senderToken}`)
      .send({
        recieverAcctNo: "nonExistentAccountNumber",
        amount: "500",
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid Account number.");
  });
});
