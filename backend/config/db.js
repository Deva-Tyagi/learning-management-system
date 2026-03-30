const mongoose = require('mongoose');
const dns = require('dns');

// Temporary fix for ECONNREFUSED: Override DNS to Google/Cloudflare
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Could not set DNS servers:', e.message);
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    if (err.message.includes('ECONNREFUSED')) {
      console.error('MongoDB Connection Error: DNS Resolution failed (ECONNREFUSED).');
      console.error('Please check your network connection, DNS settings (try 8.8.8.8), or verify your IP is whitelisted in MongoDB Atlas.');
    } else {
      console.error(`MongoDB Connection Error: ${err.message}`);
    }
    process.exit(1);
  }
};

module.exports = connectDB;
