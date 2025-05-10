const jwt = require('jsonwebtoken');
const { pool } = require('../config/mysql');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the database
      const [rows] = await pool.execute(
        'SELECT id, username, email FROM users WHERE id = ?',
        [decoded.id]
      );

      if (rows.length > 0) {
        req.user = rows[0];
        next();
      } else {
        res.status(401);
        throw new Error('Not authorized');
      }
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

module.exports = { protect };
