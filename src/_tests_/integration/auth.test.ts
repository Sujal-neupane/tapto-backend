import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";


describe("Authentication Integration Tests", () => {
    const testUser = {
        email: "testadmin@example.com",
        password: "Test@1234",
        fullName: "Test Admin",
        phoneNumber: "1234567890",
        shoppingPreference: "Mens Fashion",
    };

    beforeAll(async () => {
        // Ensure the test user does not exist before tests
        await UserModel.deleteOne({ email: testUser.email });
    });

    afterAll(async () => {
        // Clean up the test user after tests
        await UserModel.deleteOne({ email: testUser.email });
    });

    describe("POST /api/auth/register", () => {
        test("should register a new user successfully", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(testUser)
                .expect(201);

            expect(response.body).toHaveProperty("message");
            expect(response.body).toHaveProperty("token");
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data.email).toBe(testUser.email);
            expect(response.body.data.fullName).toBe(testUser.fullName);
            expect(response.body.data.phoneNumber).toBe(testUser.phoneNumber);
        });

        test("should not register user with duplicate email", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send(testUser)
                .expect(400);

            expect(response.body).toHaveProperty("message");
        });

        test("should not register user without email", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    password: "Test@1234",
                    fullName: "Test User",
                })
                .expect(400);

            expect(response.body).toHaveProperty("message");
        });
    });

    describe("POST /api/auth/login", () => {
        test("should login successfully with valid credentials", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: testUser.email,
                    password: testUser.password,
                })
                .expect(200);

            expect(response.body).toHaveProperty("token");
            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data");
            expect(response.body.data.email).toBe(testUser.email);
        });

        test("should fail login with incorrect password", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: testUser.email,
                    password: "WrongPassword123",
                })
                .expect(401);

            expect(response.body).toHaveProperty("message");
        });

        test("should fail login with non-existent email", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "nonexistent@example.com",
                    password: "Test@1234",
                })
                .expect(401);

            expect(response.body).toHaveProperty("message");
        });

        test("should not login without email", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    password: "Test@1234",
                })
                .expect(400);

            expect(response.body).toHaveProperty("message");
        });
    });
});