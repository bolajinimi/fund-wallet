import mongoose from "mongoose";
import app from "../index";
import request from "supertest";
import { userModel } from "../model/user";
import { generateJwtToken } from "../utils/util";
import { IUser } from "../utils/interfaces";

describe("Account Controller", () => {
  let user1: IUser;
  let user2: IUser;

  beforeEach(() => {
    app;
    user1 = new userModel();
    user2 = new userModel();
  });

  afterEach(async () => {
    app.close();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  describe("POST /api/account", () => {
    it("should return 401, if user is not logged in.", async () => {
      const response = await request(app).post("/api/account");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Not Authorized");
    });
    it("should create account", async () => {
      const token = await generateJwtToken(user1._id);
      const response = await request(app)
        .post("/api/account")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Account created successfully");
      expect(response.body.acct).toBeDefined();
    });
    it("should return 400 if account already exists", async () => {
      const token = await generateJwtToken(user1._id);
      await request(app)
        .post("/api/account")
        .set("Authorization", `Bearer ${token}`);

      const response = await request(app)
        .post("/api/account")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Account already created.");
    });
  });

  describe("GET account details", () => {
    it("should return 401, if user is not logged in.", async () => {
      const response = await request(app).get("/api/account");

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("Not Authorized");
    });
  });
  it("should return 200 and retrieve account.", async () => {
    const token = await generateJwtToken(user1._id);

    const response = await request(app)
      .get("/api/account")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Accounts retrieved successfully");
    expect(response.body.account).toBeDefined();
  });

  describe("Fund wallet endpoint /api/account/fund", () => {
    it("should return 400 and Kindly create an account before funding.", async () => {
      const token = await generateJwtToken(user1._id);
      const response = await request(app)
        .post("/api/account/fund")
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 400 });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(
        "Kindly create an account before funding."
      );
    });
    it("should return 200, Account funded successfully", async () => {
      const token = await generateJwtToken(user1._id);
      await request(app)
        .post("/api/account")
        .set("Authorization", `Bearer ${token}`);
      const response = await request(app)
        .post("/api/account/fund")
        .set("Authorization", `Bearer ${token}`)
        .send({ amount: 400 });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Account funded successfully");
      expect(response.body.account).toBeDefined();
    });
  });
});
