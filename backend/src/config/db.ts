import mongoose, { ConnectOptions } from 'mongoose';
import { env } from './env.js';

const connectionOptions: ConnectOptions = {
  serverSelectionTimeoutMS: 5000,
  autoIndex: true,
};

export const connectDB = async (): Promise<typeof mongoose | null> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, connectionOptions);

    console.log(`[Database] MongoDB connected successfully to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    console.error(`[Database Error] Failed to connect to MongoDB: ${message}`);
    // Do not crash server in dev so health endpoint reports database status accurately
    return null;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('[Database] MongoDB disconnected cleanly');
  } catch (error) {
    console.error('[Database Error] Error during disconnection:', error);
  }
};
