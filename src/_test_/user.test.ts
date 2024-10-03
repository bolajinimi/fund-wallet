import request from "supertest";
import app from "../index";
import mongoose from "mongoose";

describe("User sign in and sign up test", () => {
  beforeEach(() => {
    app;
  });
  afterEach(() => {
    app.close();
  });
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  //sign up tests
  it("should create a new user", async () => {
    const response = await request(app).post("/api/signup").send({
      email: "test@example.com",
      password: "password123",
      confirm_password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Signup Successful");
    expect(response.body.user.email).toBe("test@example.com");
  });

  it("should handle password mismatch", async () => {
    const response = await request(app).post("/api/signup").send({
      email: "test@example.com",
      password: "password123",
      confirm_password: "differentpassword",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "password and confirm_password does not match"
    );
  });

  it("should handle existing user", async () => {
    await request(app).post("/api/signup").send({
      email: "test@example.com",
      password: "password123",
      confirm_password: "password123",
    });

    const response = await request(app).post("/api/signup").send({
      email: "test@example.com",
      password: "newpassword123",
      confirm_password: "newpassword123",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User already exists, kindly signin");
  });

  // Sign in tests
  it("should sign in an existing user", async () => {
    await request(app).post("/api/signup").send({
      email: "test@example.com",
      password: "password123",
      confirm_password: "password123",
    });

    const response = await request(app).post("/api/signin").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("SignIn Successful");
    expect(response.body.token).toBeDefined();
  });

  it("should handle invalid credentials", async () => {
    const response = await request(app).post("/api/signin").send({
      email: "test@example.com",
      password: "invalidpassword",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid credentials.");
  });

  it("should handle invalid credentials", async () => {
    const response = await request(app).post("/api/signin").send({
      email: "nonexistent@example.com",
      password: "invalidpassword",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User does not exist, kindly sign up.");
  });
});
