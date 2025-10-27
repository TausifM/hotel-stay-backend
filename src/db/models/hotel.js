import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

export const Hotel = sequelize.define('Hotel', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  address: { type: DataTypes.TEXT },
  timezone: { type: DataTypes.STRING, defaultValue: 'UTC' },
  settings: { type: DataTypes.JSONB, defaultValue: {} }
}, {
  tableName: 'hotels',
  timestamps: true
});
