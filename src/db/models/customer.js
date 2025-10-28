import { DataTypes } from "sequelize";
import { sequelize } from '../index.js';

export const Customer = sequelize.define('Customer', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },

  hotelId: { type: DataTypes.UUID, allowNull: false },
  createdBy: { type: DataTypes.UUID, allowNull: false },

  name: { type: DataTypes.STRING, allowNull: false },
  dob: { type: DataTypes.DATE },
  gender: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING },
   // 🏠 Room info
  roomId: { type: DataTypes.UUID, allowNull: true },
  roomNumber: { type: DataTypes.STRING },

  idType: { type: DataTypes.STRING, defaultValue: 'Aadhaar' },
  aadharNumber: { type: DataTypes.STRING, unique: true },
  idImageUrl: { type: DataTypes.STRING },
  ocrText: { type: DataTypes.TEXT },
  address: { type: DataTypes.TEXT },

  verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  checkInId: { type: DataTypes.UUID },
  lastCheckInDate: { type: DataTypes.DATE },
  lastCheckOutDate: { type: DataTypes.DATE },
  metadata: { type: DataTypes.JSONB, defaultValue: {} }
}, {
  tableName: 'customers',
  timestamps: true,
  indexes: [
    { fields: ['hotelId'] },
    { fields: ['phone'] },
    { fields: ['aadharNumber'] },
    { fields: ['createdBy'] }
  ]
});
