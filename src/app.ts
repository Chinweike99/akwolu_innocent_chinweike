import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { sequelize } from './models';
import { generalRateLimiter } from './middlewares/rateLimit';
import router from './routes/routes';

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

  // async initializeDatabase(): Promise<void> {
  //   try {
  //     await sequelize.authenticate();
  //     console.log('Database connection established successfully.');

  //     if (process.env.NODE_ENV === 'development') {
  //     await sequelize.sync({ alter: true });
  //     console.log('Database synced in development mode');
  //     } else if (process.env.NODE_ENV === 'production') {
  //       await sequelize.sync({ force: false });
  //       console.log('Database synced in production mode');
  //     }
  //   } catch (error) {
  //     console.error('Unable to connect to the database:', error);
  //     process.exit(1);
  //   }
  // }
  
      async initializeDatabase(): Promise<void> {
        try {
          await sequelize.authenticate();
          console.log('Database connection established successfully.');
          // Don't sync - tables are created by schema.sql
        } catch (error) {
          console.error('Unable to connect to the database:', error);
          process.exit(1);
        }
      }

  async start(port: number = 3000): Promise<void> {
    await this.initializeDatabase();
    this.app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  }
}
