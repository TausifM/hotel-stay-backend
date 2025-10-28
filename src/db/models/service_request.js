// models/serviceRequest.js
import { DataTypes } from "sequelize";
import { sequelize } from "../index.js";

export const ServiceRequest = sequelize.define("ServiceRequest", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  hotelId: { type: DataTypes.UUID, allowNull: false },
  roomId: { type: DataTypes.UUID },
  customerId: { type: DataTypes.UUID },
  type: { type: DataTypes.ENUM("food", "cleaning", "laundry", "maintenance", "other"), allowNull: false },
  status: { type: DataTypes.ENUM("pending", "in_progress", "completed", "cancelled"), defaultValue: "pending" },
  description: { type: DataTypes.TEXT },
  createdBy: { type: DataTypes.UUID },
  metadata: { type: DataTypes.JSONB, defaultValue: {} },
}, {
  tableName: "service_requests",
  timestamps: true,
});
