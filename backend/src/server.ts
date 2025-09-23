import express from 'express';
import http from 'http';
import cors from 'cors';
import { setupWebSocket } from './ws';
import routes from './routes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.disable('etag');
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use('/api', routes);

setupWebSocket(server);

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 