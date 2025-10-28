// models/notification.js
import { DataTypes } from "sequelize";
import { sequelize } from "../index.js";

export const Notification = sequelize.define("Notification", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  hotelId: { type: DataTypes.UUID, allowNull: false },
  recipientId: { type: DataTypes.UUID }, // staff or customer
  message: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.ENUM("whatsapp", "email", "sms", "system"), defaultValue: "system" },
  status: { type: DataTypes.ENUM("queued", "sent", "failed"), defaultValue: "queued" },
  metadata: { type: DataTypes.JSONB, defaultValue: {} },
}, {
  tableName: "notifications",
  timestamps: true,
});
