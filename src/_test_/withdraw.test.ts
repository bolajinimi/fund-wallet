import request from "supertest";
import app from "../index";
import mongoose from "mongoose";
import { generateAcctNo, generateJwtToken } from "../utils/util";
import { userModel } from "../model/user";
import { accountModel } from "../model/account";
import { IUser } from "../utils/interfaces";

describe("Fund withdrawal api/account/withdraw", () => {
  let user: IUser;
  let token: string;

  beforeEach(async () => {
    app;
    user = new userModel();
    token = (await generateJwtToken(user._id)) as string;
  });

  afterEach(async () => {
    app.close();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  describe("Post /api/account/withdraw", () => {
    it("should fail, return 400, Kindly create an account before making withdraw.", async () => {
      const response = await request(app)
        .post("/api/account/withdraw")
        .send({
          amount: 300,
        })
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Kindly create an account before making withdraw."
      );
    });

    it("should fail, return 400 with Insufficient fund ", async () => {
      const senderAccount = new accountModel({
        user_id: user._id,
        acctNo: generateAcctNo(),
      });
      await senderAccount.save();
      const response = await request(app)
        .post("/api/account/withdraw")
        .send({
          amount: 300,
        })
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Insufficient fund.");
    });
    it("should pass, return 200 with Withdrawal successfully", async () => {
      const senderAccount = new accountModel({
        user_id: user._id,
        acctNo: generateAcctNo(),
        balance: 500,
      });
      await senderAccount.save();
      const response = await request(app)
        .post("/api/account/withdraw")
        .send({
          amount: 300,
        })
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Withdrawal successfully");
      expect(response.body.account).toBeDefined();
      const updatedAccount = await accountModel.findOne({
        user_id: user._id,
      });

      expect(updatedAccount?.balance).toBe(200);
    });
  });
});
