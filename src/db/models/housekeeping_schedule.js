// models/housekeepingSchedule.js
import { DataTypes } from "sequelize";
import { sequelize } from "../index.js";

export const HousekeepingSchedule = sequelize.define("HousekeepingSchedule", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  hotelId: { type: DataTypes.UUID, allowNull: false },
  roomId: { type: DataTypes.UUID },
  staffId: { type: DataTypes.UUID },
  date: { type: DataTypes.DATE, allowNull: false },
  status: { type: DataTypes.ENUM("scheduled", "in_progress", "completed"), defaultValue: "scheduled" },
}, {
  tableName: "housekeeping_schedule",
  timestamps: true,
});
