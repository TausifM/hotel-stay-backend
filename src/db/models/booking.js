import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';
import { Hotel } from './hotel.js';
import { Room } from './room.js';

export const Booking = sequelize.define('Booking', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  hotelId: { type: DataTypes.UUID, allowNull: false },
  roomId: { type: DataTypes.UUID },
  guestName: { type: DataTypes.STRING, allowNull: false },
  guestEmail: { type: DataTypes.STRING, allowNull: true },
  checkinAt: { type: DataTypes.DATE, allowNull: false },
  checkoutAt: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM('reserved','checked_in','checked_out','cancelled'), defaultValue: 'reserved' },
  price: { type: DataTypes.DECIMAL(10,2), defaultValue: 0.00 },
  paymentStatus: { type: DataTypes.ENUM('pending','paid','failed', 'refunded'), defaultValue: 'pending' },
  paymentMethod: { type: DataTypes.STRING },
  createdBy: { type: DataTypes.UUID, allowNull: false },
  metadata: { type: DataTypes.JSONB, defaultValue: {} }
}, { tableName: 'bookings', timestamps: true });

Booking.belongsTo(Hotel, { foreignKey: 'hotelId', as: 'hotel' });
Booking.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });
