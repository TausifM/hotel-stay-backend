// models/staff.js
import { DataTypes } from "sequelize";
import { sequelize } from "../index.js";

export const Staff = sequelize.define("Staff", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  hotelId: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true },
  phone: { type: DataTypes.STRING },
  role: {
    type: DataTypes.ENUM("manager", "reception", "housekeeping", "maintenance", "admin"),
    defaultValue: "reception"
  },
  permissions: { type: DataTypes.JSONB, defaultValue: {} },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: "staff",
  timestamps: true,
});
