// models/payment.js
import { DataTypes } from "sequelize";
import { sequelize } from "../index.js";

export const Payment = sequelize.define("Payment", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  hotelId: { type: DataTypes.UUID, allowNull: false },
  bookingId: { type: DataTypes.UUID },
  customerId: { type: DataTypes.UUID },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  currency: { type: DataTypes.STRING, defaultValue: "INR" },
  method: { type: DataTypes.ENUM("cash", "card", "upi", "wallet", "netbanking"), allowNull: false },
  transactionId: { type: DataTypes.STRING },
  status: { type: DataTypes.ENUM("pending", "success", "failed", "refunded"), defaultValue: "pending" },
  paymentDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  metadata: { type: DataTypes.JSONB, defaultValue: {} }
}, {
  tableName: "payments",
  timestamps: true,
  indexes: [{ fields: ["hotelId"] }, { fields: ["customerId"] }],
});
