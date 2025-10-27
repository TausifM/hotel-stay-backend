// db/models/user.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../index.js';
import bcrypt from 'bcryptjs';

export const User = sequelize.define('User', {
  id: { 
    type: DataTypes.UUID, 
    defaultValue: DataTypes.UUIDV4, 
    primaryKey: true 
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true, 
    validate: { isEmail: true } 
  },
  passwordHash: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  phone: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  role: {
    type: DataTypes.ENUM('superadmin', 'hotelOwner', 'admin', 'manager', 'staff', 'reception', 'guest'),
    defaultValue: 'guest'
  },

  // The main hotel this user belongs to
  tenantId: { 
    type: DataTypes.UUID, 
    allowNull: true, 
    references: { model: 'hotels', key: 'id' } 
  },

  // For hotelOwner or staff of multiple hotels
  hotelIds: { 
    type: DataTypes.ARRAY(DataTypes.UUID), // store multiple hotel IDs
    defaultValue: [] 
  },

  // Staff management
  createdBy: { 
    type: DataTypes.UUID, 
    allowNull: true // admin or owner who created this user
  },

  // Optional: profile & status
  profileImageUrl: { 
    type: DataTypes.STRING 
  },
  active: { 
    type: DataTypes.BOOLEAN, 
    defaultValue: true 
  },
  lastLoginAt: { 
    type: DataTypes.DATE 
  }
}, {
  tableName: 'users',
  timestamps: true
});

// Password helper
User.prototype.validatePassword = async function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};
