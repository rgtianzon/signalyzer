const mongoose = require('mongoose');

const agenttaskSchema = new mongoose.Schema({
    taskID: Number,
    userName: String,
    fullName: String,
    taskName: String,
    taskType: String,
    startDate: String,
    endDate: String,
    durationTime: String,
    durationHr: Number,
    durationMn: Number,
    durationSc: Number,
    onGoing: Boolean,
    comments: String,
    UpdatedBy: String

}, { timestamps: { createdAt: 'created_at' } });

const Agenttask = mongoose.model('Agenttask', agenttaskSchema);
module.exports = Agenttask;