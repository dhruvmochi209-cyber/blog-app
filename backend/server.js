import 'dotenv/config'; // Load .env variables before anything else
import app from './src/app.js';
import connectDB from './src/config/db.js';

const PORT = process.env.PORT || 5001;

/**
 * Server bootstrap:
 * 1. Connect to MongoDB.
 * 2. Start the HTTP server only after DB is ready.
 * 3. Register graceful shutdown handlers.
 */
const startServer = async () => {
  // Establish database connection first
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Engineering Blog API is running!`);
    console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Port        : ${PORT}`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health\n`);
  });

  // ─── Graceful Shutdown ──────────────────────────────────────────────────────

  /**
   * Handle SIGTERM (Docker stop, Kubernetes pod termination, process managers).
   * Close the HTTP server first (stop accepting new connections),
   * then terminate cleanly.
   */
  const shutdown = (signal) => {
    console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('✅ HTTP server closed.');
      process.exit(0);
    });

    // Force exit after 10 seconds if server doesn't close naturally
    setTimeout(() => {
      console.error('❌ Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT')); // Ctrl+C in terminal

  // ─── Unhandled Rejection Guard ──────────────────────────────────────────────

  /**
   * Catch any unhandled Promise rejections (e.g., missed await, forgotten try/catch).
   * Logs the error and exits so the process manager can restart cleanly.
   */
  process.on('unhandledRejection', (reason) => {
    console.error('💥 Unhandled Promise Rejection:', reason);
    server.close(() => process.exit(1));
  });
};

startServer();
