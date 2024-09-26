import 'dotenv/config';
import express from 'express';
import fileUpload from 'express-fileupload';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import logger from 'morgan';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '.env');
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment && !fs.existsSync(envPath))
  throw new Error('Could not find .env file');

import indexRouter from './routes/index.js';

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.use(fileUpload());
app.use(express.static(join(__dirname, 'public')));

app.use('/api/v1', indexRouter);

export default app;
