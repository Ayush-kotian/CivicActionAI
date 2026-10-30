import dotenv from 'dotenv';
dotenv.config();

import { app } from './app.js';
import { connectDB } from './config/db.js';
import { ensureDemoAdmin } from './utils/initAdmin.js';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await connectDB();
    await ensureDemoAdmin();
    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  CivicActionAI Backend running on port ${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  AI Engine: ${process.env.GEMINI_API_KEY ? 'Google Gemini Enabled' : 'Deterministic Civic Engine Active'}`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });

    const shutdown = () => {
      console.log('[Server] Gracefully terminating server...');
      server.close(() => {
        console.log('[Server] Process exited cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

process.on('unhandledRejection', (err) => {
  console.error('[Unhandled Rejection]', err);
});

process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
});

bootstrap();
