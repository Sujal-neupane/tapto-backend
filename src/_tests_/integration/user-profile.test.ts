import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("User Profile Management Integration Tests", () => {
    let userToken: string;
    let userId: string;

    const testUser = {
        email: "profiletest@example.com",
        password: "Profile@1234",
        fullName: "Profile Test User",
        phoneNumber: "1234567890",
        shoppingPreference: "Mens Fashion"
    };

    beforeAll(async () => {
        // Clean up and create test user
        await UserModel.deleteOne({ email: testUser.email });

        const registerResponse = await request(app)
            .post("/api/auth/register")
            .send(testUser);

        userToken = registerResponse.body.token;
        userId = registerResponse.body.data.id;
    });

    afterAll(async () => {
        // Clean up test user
        await UserModel.deleteOne({ email: testUser.email });
    });

    describe("GET /api/auth/me", () => {
        test("should get current user profile", async () => {
            const response = await request(app)
                .get("/api/auth/me")
                .set("Authorization", `Bearer ${userToken}`)
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data.email).toBe(testUser.email);
            expect(response.body.data.fullName).toBe(testUser.fullName);
            expect(response.body.data.shoppingPreference).toBe(testUser.shoppingPreference);
            expect(response.body.data).not.toHaveProperty("password");
        });

        test("should fail without authentication", async () => {
            const response = await request(app)
                .get("/api/auth/me")
                .expect(401);

            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("message");
        });
    });

    describe("PUT /api/auth/update-profile", () => {
        test("should update user profile successfully", async () => {
            const updateData = {
                fullName: "Updated Profile User",
                phoneNumber: "0987654321",
                shoppingPreference: "Womens Fashion"
            };

            const response = await request(app)
                .put("/api/auth/update-profile")
                .set("Authorization", `Bearer ${userToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data.fullName).toBe(updateData.fullName);
            expect(response.body.data.phoneNumber).toBe(updateData.phoneNumber);
            expect(response.body.data.shoppingPreference).toBe(updateData.shoppingPreference);
        });

        test("should update profile picture URL", async () => {
            const updateData = {
                profilePicture: "https://example.com/profile.jpg"
            };

            const response = await request(app)
                .put("/api/auth/update-profile")
                .set("Authorization", `Bearer ${userToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data.profilePicture).toBe(updateData.profilePicture);
        });

        test("should fail with invalid data", async () => {
            const response = await request(app)
                .put("/api/auth/update-profile")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ email: "invalid-email" })
                .expect(400);

            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("message");
        });
    });

    describe("PUT /api/auth/:id", () => {
        test("should update user by ID (self)", async () => {
            const updateData = {
                fullName: "Self Updated User",
                country: "Nepal"
            };

            const response = await request(app)
                .put(`/api/auth/${userId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data.fullName).toBe(updateData.fullName);
            expect(response.body.data.country).toBe(updateData.country);
        });

        test("should fail updating non-existent user's profile", async () => {
            const fakeUserId = "507f1f77bcf86cd799439011"; // Fake ID

            const response = await request(app)
                .put(`/api/auth/${fakeUserId}`)
                .set("Authorization", `Bearer ${userToken}`)
                .send({ fullName: "Hacked Name" })
                .expect(404);

            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("message");
        });
    });
});

describe("Input Validation Integration Tests", () => {
    describe("Registration Validation", () => {
        test("should reject registration with invalid email", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    email: "invalid-email",
                    password: "ValidPass@123",
                    fullName: "Invalid Email User",
                    phoneNumber: "1234567890"
                })
                .expect(400);

            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("message");
        });

        test("should reject registration with missing required fields", async () => {
            const response = await request(app)
                .post("/api/auth/register")
                .send({
                    email: "incomplete@example.com"
                    // Missing password, fullName, phoneNumber
                })
                .expect(400);

            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("message");
        });
    });

    describe("Login Validation", () => {
        test("should reject login with empty credentials", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("message");
        });

        test("should reject login with malformed email", async () => {
            const response = await request(app)
                .post("/api/auth/login")
                .send({
                    email: "not-an-email",
                    password: "password123"
                })
                .expect(400);

            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("message");
        });
    });
});