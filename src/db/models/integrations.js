// models/integration.js
import { DataTypes } from "sequelize";
import { sequelize } from "../index.js";

export const Integration = sequelize.define("Integration", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  hotelId: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.STRING, allowNull: false }, // OTA, PaymentGateway, WhatsApp, etc.
  apiKey: { type: DataTypes.STRING },
  credentials: { type: DataTypes.JSONB, defaultValue: {} },
  active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: "integrations",
  timestamps: true,
});
