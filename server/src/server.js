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
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  CivicActionAI Backend running on port ${PORT}`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  AI Engine: ${process.env.GEMINI_API_KEY ? 'Google Gemini Enabled' : 'Deterministic Civic Engine Active'}`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

bootstrap();
