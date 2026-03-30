const GlobalSetting = require('../models/GlobalSetting');
const jwt = require('jsonwebtoken');

const maintenanceMiddleware = async (req, res, next) => {
    try {
        // 1. Always allow super-admin ROUTES
        if (req.path.startsWith('/api/super-admin')) {
            return next();
        }

        const settings = await GlobalSetting.findOne();
        
        // 2. If maintenance is OFF, allow everything
        if (!settings || !settings.isMaintenanceMode) {
            return next();
        }

        // 3. Maintenance is ON. Check if the user is a Superadmin to exempt them.
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'yerajbhiusiksathchlagya');
                
                // ONLY exempt if the token explicitly has the isSuperAdmin flag
                if (decoded && decoded.isSuperAdmin) {
                    return next();
                }
            } catch (err) {
                // Invalid token, treat as normal user
            }
        }

        // 4. Block everyone else
        return res.status(503).json({
            maintenance: true,
            msg: settings.maintenanceMessage || "Platform is currently under maintenance.",
            platformName: settings.platformName
        });
    } catch (err) {
        console.error("Maintenance Switch Error:", err);
        next();
    }
};

module.exports = maintenanceMiddleware;
