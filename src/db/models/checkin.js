import { DataTypes } from "sequelize";
import {sequelize} from "../index.js";

export const Checkin = sequelize.define('Checkin', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  bookingId: { type: DataTypes.UUID, allowNull: false },
  idDocumentUrl: { type: DataTypes.STRING },
  verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verifiedAt: { type: DataTypes.DATE },
  name: { type: DataTypes.STRING },
  gender: { type: DataTypes.STRING },
  dob: { type: DataTypes.STRING },
  aadhaarNumber: { type: DataTypes.STRING },
  address: { type: DataTypes.TEXT },
  metadata: { type: DataTypes.JSONB, defaultValue: {} }
}, { tableName: 'checkins', timestamps: true });
