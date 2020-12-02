const mongoose = require('mongoose');

const TasksSchema = new mongoose.Schema({
    taskID: Number,
    taskU: String,
    taskName: String,
    taskType: String,
    details: String
}, { timestamps: { createdAt: 'created_at' } });

const Task = mongoose.model('Task', TasksSchema);
module.exports = Task;