const mongoose = require('mongoose');

const agenttaskSchema = new mongoose.Schema({
    taskID: Number,
    userName: String,
    fullName: String,
    taskName: String,
    startDate: String,
    endDate: String,
    durationTime: Number,
    durationHr: Number,
    durationMn: Number,
    durationSc: Number,
    onGoing: Boolean

}, { timestamps: { createdAt: 'created_at' } });

const Agenttask = mongoose.model('Agenttask', agenttaskSchema);
module.exports = Agenttask;