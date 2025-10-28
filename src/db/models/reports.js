// models/report.js
import { DataTypes } from "sequelize";
import { sequelize } from "../index.js";

export const Report = sequelize.define("Report", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  hotelId: { type: DataTypes.UUID, allowNull: false },
  reportType: { type: DataTypes.STRING, allowNull: false }, // e.g. revenue, occupancy
  data: { type: DataTypes.JSONB, defaultValue: {} },
  generatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: "reports",
  timestamps: true,
});
