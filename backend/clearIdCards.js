require('dotenv').config();
const mongoose = require('mongoose');
const IdCard = require('./models/IdCard');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');
        const res = await IdCard.deleteMany({});
        console.log('Deleted cards:', res.deletedCount);
        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
}
run();
