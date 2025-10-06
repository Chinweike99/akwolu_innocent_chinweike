import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { sequelize, syncDatabase } from './models';
import { generalRateLimiter } from './middlewares/rateLimit';
import router from './routes/routes';
import { DatabaseConnection } from './config/database-connection';

export class App {
  public app: express.Application;

  constructor() {
    this.app = express();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(generalRateLimiter);
  }

  private initializeRoutes(): void {
    this.app.use('/api', router);
  }

  private initializeErrorHandling(): void {
    this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Unhandled error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
        },
      });
    });
  }
      async initializeDatabase(): Promise<void> {
        try {
          await DatabaseConnection.testConnection();
          // Sync database in development (not in production)
          if (process.env.NODE_ENV === 'development') {
            await syncDatabase(false); 
          }
          console.log('Database initialization completed');
        } catch (error) {
          console.error('Unable to connect to the database:', error);
          process.exit(1);
        }
      }

  async start(port: number = 3000): Promise<void> {
    await this.initializeDatabase();
    this.app.listen(port, () => {
      console.log(`Server running on port ${port}`);
        console.log(`Environment: ${process.env.NODE_ENV}`);
        console.log(`Health check: http://localhost:${port}/health`);
    });
  }
}
