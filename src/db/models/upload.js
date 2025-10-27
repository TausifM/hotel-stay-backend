import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';

export const Upload = sequelize.define('Upload', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  ownerId: { type: DataTypes.UUID },
  filename: { type: DataTypes.STRING },
  path: { type: DataTypes.STRING },
  mimeType: { type: DataTypes.STRING },
  size: { type: DataTypes.INTEGER }
}, { tableName: 'uploads', timestamps: true });
