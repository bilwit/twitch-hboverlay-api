import express, { Express } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import cors from 'cors';
import compression from 'compression';
import { PrismaClient } from '@prisma/client';
import httpsServer from './httpsServer';

dotenv.config();

const app: Express = express();
const prisma = new PrismaClient();

app.set('trust proxy', true);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  express.raw({
    inflate: true,
    type: 'application/x-www-form-urlencoded',
  }),
);
app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'client/dist')));

// any: for some reason I can't extend Request type to use custom properties
app.use((req: any, _res, next) => {
  req['db'] = prisma;
  return next();
});

app.use('/api', require('./routes/router')());

httpsServer(app)?.();
