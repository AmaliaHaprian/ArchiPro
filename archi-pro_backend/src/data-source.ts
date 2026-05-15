
import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: ['dist/user/user.js', 'dist/user/access-control.js', 'dist/project/Project.js', 'dist/logging/LogEntry.js', 'dist/logging/SuspiciousUser.js'],
  migrations: ['dist/migrations/*.js'],
  synchronize: false,
});