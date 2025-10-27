import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';
import { Hotel } from './hotel.js';

export const Room = sequelize.define('Room', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  hotelId: { type: DataTypes.UUID, allowNull: false },
  number: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.STRING, defaultValue: 'standard' },
  rate: { type: DataTypes.DECIMAL(10,2), defaultValue: 0.00 },
  status: { type: DataTypes.ENUM('available','occupied','cleaning','maintenance'), defaultValue: 'available' },
  meta: { type: DataTypes.JSONB, defaultValue: {} }
}, { tableName: 'rooms', timestamps: true });

// association helper
Room.belongsTo(Hotel, { foreignKey: 'hotelId', as: 'hotel' });
