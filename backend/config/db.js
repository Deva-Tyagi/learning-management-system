const mongoose = require('mongoose');
const dns = require('dns');

// Temporary fix for ECONNREFUSED: Override DNS to Google/Cloudflare
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  console.warn('Could not set DNS servers:', e.message);
}

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      if (!process.env.MONGO_URI) {
        throw new Error('MONGO_URI is not defined in environment variables');
      }
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ MongoDB connected');
      return;
    } catch (err) {
      retries++;
      console.error(`❌ MongoDB Connection Error (Attempt ${retries}/${maxRetries}): ${err.message}`);
      
      if (err.message.includes('ECONNREFUSED')) {
        console.error('💡 Hint: Check your network/DNS settings or IP whitelist in MongoDB Atlas.');
      }
      
      if (retries < maxRetries) {
        console.log(`🔄 Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      } else {
        console.error('💥 Max retries reached. Exiting...');
        process.exit(1);
      }
    }
  }
};

module.exports = connectDB;
