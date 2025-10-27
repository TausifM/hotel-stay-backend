import { sequelize } from './index.js';
import './models/index.js'; // import models to register them
import dotenv from 'dotenv';
dotenv.config();

async function sync() {
  try {
    await sequelize.sync({ alter: true });
    console.log('DB synced (alter true).');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

sync();
