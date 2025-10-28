// models/notification.js
import { DataTypes } from "sequelize";
import { sequelize } from "../index.js";

export const Notification = sequelize.define("Notification", {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
  },
  hotelId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // optional (if specific user: hotelOwner, admin, manager, etc.)
  },
  staffId: { type: DataTypes.UUID, allowNull: true },
  customerId: { type: DataTypes.UUID, allowNull: true },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "e.g., BookingUpdate, ServiceRequest, Payment",
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  roleTarget: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: "Target role:  hotelOwner, superadmin, admin, manager, housekeeping, reception, etc.",
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sentAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
    tableName: "notifications",
    timestamps: true,
});