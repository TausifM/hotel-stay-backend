import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { sequelize } from './db/index.js';
import authRoutes from './routes/auth.js';
import hotelsRoutes from './routes/hotels.js';
import roomsRoutes from './routes/rooms.js';
import bookingsRoutes from './routes/bookings.js';
import checkinRoutes from './routes/checkin.js';
import uploadRoutes from './routes/upload.js';
import { initRealtime } from './realtime/index.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: '*' }
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => res.json({ ok: true, env: process.env.NODE_ENV || 'development' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelsRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/upload', uploadRoutes);

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

// init realtime
initRealtime(io);

// DB & start
const PORT = process.env.PORT || 5000;
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    // optionally sync models to DB; call separate migration in prod
    // await sequelize.sync({ alter: true });
    server.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error('Failed to start', err);
    process.exit(1);
  }
}

start();

// graceful shutdown
process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down...');
  server.close(async () => {
    await sequelize.close();
    console.log('Connections closed. Bye.');
    process.exit(0);
  });
});
