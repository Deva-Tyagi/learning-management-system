
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  const client = await Admin.findOne();
  if (!client) {
    console.log('No clients found to test');
    process.exit();
  }

  console.log('Testing update for client:', client._id);
  const newPlan = client.plan === "Basic" ? "Premium" : client.plan === "Premium" ? "Enterprise" : "Basic";
  
  try {
    client.plan = newPlan;
    await client.save();
    console.log('Successfully updated plan to:', newPlan);
  } catch (err) {
    console.error('Update failed:', err.message);
  }

  process.exit();
}

test();
