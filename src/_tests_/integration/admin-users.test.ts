import request from "supertest";
import app from "../../app";
import { UserModel } from "../../models/user.model";

describe("Admin User Management Integration Tests", () => {
    let adminToken: string;
    let userId: string;
    let testUser: any;

    const adminUser = {
        email: "admintest@example.com",
        password: "Admin@1234",
        fullName: "Admin Test User",
        phoneNumber: "1234567890",
        shoppingPreference: "Mens Fashion",
        role: "admin"
    };

    const regularUser = {
        email: "regulartest@example.com",
        password: "User@1234",
        fullName: "Regular Test User",
        phoneNumber: "0987654321",
        shoppingPreference: "Womens Fashion"
    };

    beforeAll(async () => {
        // Clean up test users
        await UserModel.deleteMany({
            email: { $in: [adminUser.email, regularUser.email] }
        });

        // Create admin user
        const adminResponse = await request(app)
            .post("/api/auth/register")
            .send(adminUser);

        adminToken = adminResponse.body.token;

        // Create regular user
        const userResponse = await request(app)
            .post("/api/auth/register")
            .send(regularUser);

        testUser = userResponse.body.data;
        userId = testUser.id;
    });

    afterAll(async () => {
        // Clean up test users
        await UserModel.deleteMany({
            email: { $in: [adminUser.email, regularUser.email] }
        });
    });

    describe("GET /api/admin/users", () => {
        test("should get all users with pagination", async () => {
            const response = await request(app)
                .get("/api/admin/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("data");
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body).toHaveProperty("pagination");
            expect(response.body.pagination).toHaveProperty("page");
            expect(response.body.pagination).toHaveProperty("limit");
            expect(response.body.pagination).toHaveProperty("total");
            expect(response.body.pagination).toHaveProperty("totalPages");
        });

        test("should filter users by search term", async () => {
            const response = await request(app)
                .get("/api/admin/users?search=Admin")
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data.length).toBeGreaterThan(0);
            // Check that results contain the search term
            response.body.data.forEach((user: any) => {
                expect(
                    user.fullName.toLowerCase().includes("admin") ||
                    user.email.toLowerCase().includes("admin")
                ).toBe(true);
            });
        });

        test("should filter users by role", async () => {
            const response = await request(app)
                .get("/api/admin/users?role=admin")
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            response.body.data.forEach((user: any) => {
                expect(user.role).toBe("admin");
            });
        });

        test("should paginate results correctly", async () => {
            const response = await request(app)
                .get("/api/admin/users?page=1&limit=1")
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data.length).toBeLessThanOrEqual(1);
            expect(response.body.pagination.page).toBe(1);
            expect(response.body.pagination.limit).toBe(1);
        });

        test("should fail without admin authentication", async () => {
            const response = await request(app)
                .get("/api/admin/users")
                .expect(401);

            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("message");
        });
    });

    describe("GET /api/admin/users/:id", () => {
        test("should get user by ID", async () => {
            const response = await request(app)
                .get(`/api/admin/users/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data._id).toBe(userId);
            expect(response.body.data).toHaveProperty("email");
            expect(response.body.data).toHaveProperty("fullName");
        });

        test("should fail for non-existent user", async () => {
            const fakeId = "507f1f77bcf86cd799439011";
            const response = await request(app)
                .get(`/api/admin/users/${fakeId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(404);

            expect(response.body).toHaveProperty("success", false);
            expect(response.body).toHaveProperty("message");
        });
    });

    describe("PUT /api/admin/users/:id", () => {
        test("should update user successfully", async () => {
            const updateData = {
                fullName: "Updated Test User",
                phoneNumber: "1111111111"
            };

            const response = await request(app)
                .put(`/api/admin/users/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data.fullName).toBe(updateData.fullName);
            expect(response.body.data.phoneNumber).toBe(updateData.phoneNumber);
        });

        test("should update user role", async () => {
            const response = await request(app)
                .put(`/api/admin/users/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ role: "admin" })
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body.data.role).toBe("admin");
        });
    });

    describe("DELETE /api/admin/users/:id", () => {
        test("should delete user successfully", async () => {
            const response = await request(app)
                .delete(`/api/admin/users/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(200);

            expect(response.body).toHaveProperty("success", true);
            expect(response.body).toHaveProperty("message");

            // Verify user is deleted
            const checkResponse = await request(app)
                .get(`/api/admin/users/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .expect(404);
        });
    });
});