import express from 'express';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { sequelize } from './db/index.js';

// 🧩 Import models & associations

import './db/models/user.js';
import './db/models/hotel.js';
import './db/models/staff.js';
import './db/models/customer.js';
import './db/models/room.js';
import './db/models/booking.js';
import './db/models/checkin.js';
import './db/models/payment.js';
import './db/models/service_request.js';
import './db/models/inventory.js';
import './db/models/maintenance_logs.js';
import './db/models/housekeeping_schedule.js';
import './db/models/feedback.js';
import './db/models/reports.js';
import './db/models/integrations.js';
import './db/models/notifications.js';

// Routes
import authRoutes from './routes/auth.js';
import hotelsRoutes from './routes/hotels.js';
import roomsRoutes from './routes/rooms.js';
import bookingsRoutes from './routes/bookings.js';
import checkinRoutes from './routes/checkin.js';
import uploadRoutes from './routes/upload.js';
import customersRoutes from './routes/customers.js';
import { initRealtime } from './realtime/index.js';
import { defineAssociations } from './db/models/associations.js';
import whatsappRoutes from './routes/whatsapp.js';
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new IOServer(server, { cors: { origin: '*' } });

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
app.use('/api/customers', customersRoutes);
app.use('/api/whatsapp', whatsappRoutes);
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

    // Define associations before syncing
    defineAssociations();

    // Sync models (use alter only in dev)
    await sequelize.sync({ alter: true });
    console.log('✅ All models synchronized with database');

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
