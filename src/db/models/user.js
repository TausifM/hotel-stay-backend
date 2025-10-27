import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';
import bcrypt from 'bcryptjs';

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING },
  role: { type: DataTypes.ENUM('admin','staff','guest'), defaultValue: 'guest' },
  tenantId: { type: DataTypes.UUID, allowNull: true }, // hotel/organization id
}, {
  tableName: 'users',
  timestamps: true
});

// instance helper
User.prototype.validatePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};
