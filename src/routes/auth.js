import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../db/models/user.js';
import { signToken } from '../utils/jwt.js';
import { Hotel } from '../db/models/hotel.js';


const router = express.Router();

// simple register (for demo: create a user & optional hotel)
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, role = 'admin', hotel } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });
    const ex = await User.findOne({ where: { email } });
    if (ex) return res.status(400).json({ error: 'Email exists' });

    let tenantId = null;
    if (hotel && role === 'admin') {
      const h = await Hotel.create({ name: hotel });
      tenantId = h.id;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name, role, tenantId });
    const token = signToken({ sub: user.id, role: user.role, tenantId: user.tenantId });
    res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name }, token });
  } catch (err) {
    next(err);
  }
});

// login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await user.validatePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ sub: user.id, role: user.role, tenantId: user.tenantId });
    res.json({ user: { id: user.id, email: user.email, role: user.role, tenantId: user.tenantId }, token });
  } catch (err) {
    next(err);
  }
});

export default router;
