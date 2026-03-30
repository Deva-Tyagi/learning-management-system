require('dotenv').config();
const mongoose = require('mongoose');
const IdCard = require('./models/IdCard');
const fs = require('fs');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const cards = await IdCard.find({}).lean();
        fs.writeFileSync('cards.json', JSON.stringify(cards, null, 2));
        process.exit(0);
    } catch(e) {
        fs.writeFileSync('cards.json', e.toString());
        process.exit(1);
    }
}
run();
