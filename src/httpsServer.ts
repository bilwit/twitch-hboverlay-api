import { readFileSync } from 'fs';
import { Express } from 'express';
import https from 'https';
import style from './utils/consoleLogStyling';
import dotenv from 'dotenv';

dotenv.config();

export default function httpsServer(app: Express) {
  try {
    const key = readFileSync('/var/opt/certs/privkey.pem', 'utf8');
    const cert = readFileSync('/var/opt/certs/cert.pem', 'utf8');
    const ca = readFileSync('/var/opt/certs/fullchain.pem', 'utf8');

    const server = https.createServer(
      {
        key: key,
        cert: cert,
        ca: ca,
      },
      app,
    );

    return function init() {
      if (server) {
        server.listen(process.env.PORT, () => {
          console.log(style('important', '🖥️ [Server]: HTTPS started https://localhost:' + process.env.PORT));
        });

        return server;
      }
    };
  } catch (e) {
    console.log(e);
  }
}
