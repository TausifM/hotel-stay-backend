// models/feedback.js
import { DataTypes } from "sequelize";
import { sequelize } from "../index.js";

export const Feedback = sequelize.define("Feedback", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  hotelId: { type: DataTypes.UUID, allowNull: false },
  customerId: { type: DataTypes.UUID },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comment: { type: DataTypes.TEXT },
  response: { type: DataTypes.TEXT },
}, {
  tableName: "feedback",
  timestamps: true,
});
