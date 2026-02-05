import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("Password Reset Integration Tests", () => {
    const testUser = {
        email: "resetuser@example.com",
        password: "Test@1234",
        fullName: "Reset Test User",
        phoneNumber: "1234567890",
        shoppingPreference: "Mens Fashion",
    };

    let otp: string;

    beforeAll(async () => {
        // Ensure the test user exists
        await UserModel.deleteOne({ email: testUser.email });
        await request(app)
            .post("/api/auth/register")
            .send(testUser);
    });

    afterAll(async () => {
        // Clean up the test user
        await UserModel.deleteOne({ email: testUser.email });
    });

    describe("POST /api/auth/request-password-reset", () => {
        test("should send reset OTP successfully", async () => {
            const response = await request(app)
                .post("/api/auth/request-password-reset")
                .send({ email: testUser.email })
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("message");

            // Get the OTP from the database for testing
            const user = await UserModel.findOne({ email: testUser.email });
            otp = user?.otp || "";
            expect(otp).toBeDefined();
            expect(user?.otpExpiry).toBeDefined();
        });

        test("should fail for non-existent email", async () => {
            const response = await request(app)
                .post("/api/auth/request-password-reset")
                .send({ email: "nonexistent@example.com" })
                .expect(404);

            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("message");
        });

        test("should fail without email", async () => {
            const response = await request(app)
                .post("/api/auth/request-password-reset")
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("message");
        });
    });

    describe("POST /api/auth/reset-password", () => {
        test("should reset password successfully with valid OTP", async () => {
            const response = await request(app)
                .post("/api/auth/reset-password")
                .send({
                    email: testUser.email,
                    otp: otp,
                    newPassword: "NewPassword@123"
                })
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("message");

            // Verify login with new password works
            const loginResponse = await request(app)
                .post("/api/auth/login")
                .send({
                    email: testUser.email,
                    password: "NewPassword@123"
                })
                .expect(200);

            expect(loginResponse.body).toHaveProperty("success", true);
            expect(loginResponse.body).toHaveProperty("token");
        });

        test("should fail with invalid OTP", async () => {
            const response = await request(app)
                .post("/api/auth/reset-password")
                .send({
                    email: testUser.email,
                    otp: "000000",
                    newPassword: "NewPassword@123"
                })
                .expect(400);

            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("message");
        });

        test("should fail with expired OTP", async () => {
            // Manually expire the OTP
            await UserModel.updateOne(
                { email: testUser.email },
                { otpExpiry: new Date(Date.now() - 1000) }
            );

            const response = await request(app)
                .post("/api/auth/reset-password")
                .send({
                    email: testUser.email,
                    otp: otp,
                    newPassword: "NewPassword@123"
                })
                .expect(400);

            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("message");
        });

        test("should fail without required fields", async () => {
            const response = await request(app)
                .post("/api/auth/reset-password")
                .send({ email: testUser.email })
                .expect(400);

            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("message");
        });
    });
});