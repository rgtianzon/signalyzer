const mongoose = require('mongoose');

const rosterSchema = new mongoose.Schema({
    sigID: Number,
    firstName: String,
    lastName: String,
    fullName: String,
    userName: String,
    password: String,
    isActive: String,
    isAdmin: String
}, { timestamps: { createdAt: 'created_at' } });

const Roster = mongoose.model('Roster', rosterSchema);
module.exports = Roster;