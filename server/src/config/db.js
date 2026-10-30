import mongoose from 'mongoose';

export async function connectDB(uri) {
  const mongoURI = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/civicactionai';
  try {
    const conn = await mongoose.connect(mongoURI, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Could not connect to MongoDB at ${mongoURI}:`, error.message);
    // In production/local, allow application to degrade gracefully if needed
    throw error;
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
}
