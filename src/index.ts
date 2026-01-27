import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { connectDatabase } from './database/mongodb';
import { PORT, CORS_ORIGIN, NODE_ENV } from './config';
import authRoutes from './routes/auth.route';
import cors from 'cors';
import path from 'path';
import orderRoutes from './routes/order.route';
import adminRoutes from './routes/admin.route';

const app: Application = express();

// Security middleware
app.use(helmet());


// CORS configuration
const corsOptions = {
    origin: CORS_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

app.use('/admin', adminRoutes);
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Logging middleware
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    return res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: NODE_ENV 
    });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({ 
        success: true, 
        message: 'Welcome to TAPTO API',
        version: '1.0.0'
    });
});

// 404 error handling
app.use((req: Request, res: Response) => {
    return res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handling middleware
app.use((err: any, req: Request, res: Response) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    console.error('Error:', err);
    
    return res.status(statusCode).json({
        success: false,
        message,
        ...(NODE_ENV === 'development' && { stack: err.stack })
    });
});

async function startServer() {
    try {
        await connectDatabase();
        
        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
            console.log(`📊 Environment: ${NODE_ENV}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

