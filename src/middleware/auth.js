import { verifyToken } from '../utils/jwt.js';
import { User } from '../db/models/user.js';

export async function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = auth.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.sub);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userRole = req.user.role;

    // Normalize roles: allow single string or array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    // Check if user's role is allowed or if they're an admin
    if (!allowedRoles.includes(userRole) && userRole !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}
