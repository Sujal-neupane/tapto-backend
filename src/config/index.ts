import dotenv from "dotenv";
dotenv.config();

export const PORT: number = 
    process.env.PORT ? parseInt(process.env.PORT) : 4000;
export const MONGODB_URI: string = 
    process.env.MONGODB_URI || 'mongodb://localhost:27017/tapto_db';

export const JWT_SECRET: string = 
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export const JWT_EXPIRE: string = 
    process.env.JWT_EXPIRE || '7d';

export const NODE_ENV: string = 
    process.env.NODE_ENV || 'development';

export const CORS_ORIGIN: string[] = 
    process.env.CORS_ORIGIN?.split(',') || [
        'http://localhost:3000', // Next.js dev
        'http://localhost:4000', // Backend origin (for tools/static)
        'http://localhost:4200'  // Angular dev (if used)
    ];
