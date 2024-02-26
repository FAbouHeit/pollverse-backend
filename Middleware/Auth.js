import { verifyToken } from '../Utils/Jwt.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res.status(401).json({ message: 'Not Authenticated, token not provided.' });
    }
    const decoded = verifyToken(token);
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

export const checkRole = (roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: You do not have the required permissions.' });
  }
};