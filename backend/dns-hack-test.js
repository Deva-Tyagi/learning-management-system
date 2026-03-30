const dns = require('dns');
const mongoose = require('mongoose');
require('dotenv').config();

// Try to use Google DNS for this process
dns.setServers(['8.8.8.8', '1.1.1.1']);

dns.resolveSrv('_mongodb._tcp.cluster0.td6mgjh.mongodb.net', (err, addresses) => {
    if (err) {
        console.error('SRV Resolution Failed (even with Google DNS):', err.message);
        return;
    }
    console.log('SRV Addresses Resolved:', addresses);
    
    // If we resolved it, try connecting
    const testConnect = async () => {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('SUCCESS: Connected to MongoDB using overridden DNS');
            process.exit(0);
        } catch (connErr) {
            console.error('Connection Failed even after SRV resolution:', connErr.message);
            process.exit(1);
        }
    };
    testConnect();
});
