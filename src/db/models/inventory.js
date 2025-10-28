// models/inventory.js
import { DataTypes } from "sequelize";
import { sequelize } from "../index.js";

export const Inventory = sequelize.define("Inventory", {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  hotelId: { type: DataTypes.UUID, allowNull: false },
  itemName: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  unit: { type: DataTypes.STRING, defaultValue: "pcs" },
  category: { type: DataTypes.STRING }, // minibar, linen, kitchen, etc.
  threshold: { type: DataTypes.INTEGER, defaultValue: 5 }, // low-stock alert
}, {
  tableName: "inventory",
  timestamps: true,
});
