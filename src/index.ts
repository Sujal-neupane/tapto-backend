
import { connectDatabase } from './database/mongodb';
import { PORT, CORS_ORIGIN, NODE_ENV } from './config';
import app from './app';



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

