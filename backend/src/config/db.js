import mongoose from 'mongoose';

/**
 * Establishes a connection to MongoDB using Mongoose.
 * Exits the process on failure so the server doesn't start in a broken state.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are defaults in Mongoose 8+ but kept explicit for clarity
      serverSelectionTimeoutMS: 5000, // Fail fast if MongoDB is unreachable
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Graceful connection event listeners
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Kill the process — no point running without DB
  }
};

export default connectDB;
