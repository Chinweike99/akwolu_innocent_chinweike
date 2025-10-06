import { Sequelize } from 'sequelize';
import { databaseConfig } from './database';

export class DatabaseConnection {
  private static instance: Sequelize;
  private static retryCount = 0;
  private static readonly maxRetries = databaseConfig.retry.max;

  public static getInstance(): Sequelize {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = this.createConnection();
    }
    return DatabaseConnection.instance;
  }

  private static createConnection(): Sequelize {
    return new Sequelize(
      databaseConfig.database,
      databaseConfig.username,
      databaseConfig.password,
      {
        host: databaseConfig.host,
        port: databaseConfig.port,
        dialect: databaseConfig.dialect,
        logging: databaseConfig.logging,
        pool: databaseConfig.pool,
        retry: {
          max: databaseConfig.retry.max,
        },
        define: {
          timestamps: true,
          underscored: true,
        },
        timezone: '+00:00',
      }
    );
  }

  public static async testConnection(): Promise<boolean> {
    try {
      const sequelize = this.getInstance();
      await sequelize.authenticate();
      console.log('Database connection established successfully.');
      this.retryCount = 0; // Reset retry count on successful connection
      return true;
    } catch (error) {
      this.retryCount++;
      console.error(`Database connection failed (attempt ${this.retryCount}/${this.maxRetries}):`, error);
      
      if (this.retryCount >= this.maxRetries) {
        console.error('Maximum database connection retries reached. Exiting...');
        process.exit(1);
      }
      
      // Wait before retrying (exponential backoff)
      const backoffTime = Math.pow(2, this.retryCount) * 1000;
      console.log(`Retrying database connection in ${backoffTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      
      return this.testConnection();
    }
  }

  public static async closeConnection(): Promise<void> {
    if (DatabaseConnection.instance) {
      await DatabaseConnection.instance.close();
      console.log('Database connection closed.');
    }
  }
}