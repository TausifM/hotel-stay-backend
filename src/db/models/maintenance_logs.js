// models/maintenanceLog.js
import { DataTypes } from "sequelize";
import { sequelize } from "../index.js";

export const MaintenanceLog = sequelize.define("MaintenanceLog", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  hotelId: { type: DataTypes.UUID, allowNull: false },
  roomId: { type: DataTypes.UUID },
  issue: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM("reported", "in_progress", "resolved"), defaultValue: "reported" },
  assignedTo: { type: DataTypes.UUID },
  remarks: { type: DataTypes.TEXT },
}, {
  tableName: "maintenance_logs",
  timestamps: true,
});
