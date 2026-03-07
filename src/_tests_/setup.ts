import { connectDatabase } from "../database/mongodb";
beforeAll(async () => {
    await connectDatabase();
});