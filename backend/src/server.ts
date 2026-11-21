import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const app = createApp();

  const server = app.listen(env.PORT, () => {
    console.log(`[Nirikshan Backend] Server listening on http://localhost:${env.PORT}`);
    console.log(`[Nirikshan Backend] Environment: ${env.NODE_ENV}`);
    console.log(`[Nirikshan Backend] Allowed Frontend: ${env.FRONTEND_URL}`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('\n[Nirikshan Backend] Gracefully shutting down...');
    server.close(() => {
      console.log('[Nirikshan Backend] HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

startServer().catch((err) => {
  console.error('[Nirikshan Backend] Fatal startup error:', err);
  process.exit(1);
});
