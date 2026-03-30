const ActivityLog = require('../models/ActivityLog');

const logActivity = (action) => {
  return async (req, res, next) => {
    // Only log if the user is an Admin (institute owner)
    if (req.user && req.user.isAdmin) {
      try {
        const log = new ActivityLog({
          adminId: req.user.id,
          action: action,
          details: `${req.method} ${req.originalUrl}`,
          ip: req.ip || req.connection.remoteAddress,
        });
        await log.save();
      } catch (err) {
        console.error('Activity logging failed:', err);
      }
    }
    next();
  };
};

module.exports = logActivity;
