const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  let token = req.header('x-auth-token') || (req.header('Authorization') ? req.header('Authorization').replace('Bearer ', '') : null);

  // Also check query params for direct download links
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ msg: 'No token. Authorization denied.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Flatten the payload: students use { user: { id... } }, admins use { id... }
    req.user = decoded.user || decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
