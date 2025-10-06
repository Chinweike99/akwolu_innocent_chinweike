import { Dialect, Options } from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

export interface DatabaseConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    dialect: Dialect;
    logging: boolean | ((sql: string, timing?: number) => void);
    pool: {
        max: number;
        min: number;
        acquire: number;
        idle: number;
    };
    retry: {
        max: number;
    };
}


export const databaseConfig: DatabaseConfig = {
    host: process.env.DB_HOST as string,
    port: parseInt(process.env.DB_PORT as string),
    username: process.env.DB_USERNAME as string,
    password: process.env.DB_PASSWORD as string,
    database: process.env.DB_NAME as string,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
        max: 20,
        min: 5,
        acquire: 60000,
        idle: 10000,
    },
    retry :{
        max: 3
    }
};

// Sequelize configuration for different environments
export const sequelizeConfig: Options = {
  ...databaseConfig,
  define: {
    timestamps: true,
    underscored: true,
  },
  timezone: '+00:00', // UTC
};
