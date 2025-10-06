import { App } from './app';
import { LeaveRequestWorker } from './workers/leaveRequestWorker';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

async function startServer() {
  try {
    const app = new App();
    await app.start(PORT);

    if (process.env.NODE_ENV === 'production') {
      const worker = new LeaveRequestWorker();
      await worker.start();
    }

    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();