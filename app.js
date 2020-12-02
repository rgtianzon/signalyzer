const express = require("express");
const app = express();
const path = require("path");
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');

// connecting to database
const dbUrl = process.env.DB_URL || 'mongodb+srv://admin:TriskelioN12@cluster0.o9j4k.mongodb.net/signals?retryWrites=true&w=majority';
mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('connection open!');
    })
    .catch(() => {
    console.log('error');
    })


const Task = require('./models/tasks');
const { render } = require("ejs");


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(methodOverride('_method'));


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/agenthome', (req, res) => {
    res.render('agenthome');
});

app.get('/adminhome', (req, res) => {
    res.render('adminhome');
});

// Adding Task

app.get('/managetask', async (req, res) => {
    const task = await Task.find({}).sort({created_at: -1})
    req.body.taskID = task[0].taskID + 1;
    res.render('managetask', { task });
})

app.post('/managetask', async (req, res) => {
    const task = await Task.find({}).sort({created_at: -1})
    req.body.taskID = task[0].taskID + 1;
    const fi = req.body.taskName.replace(/\s/g, '');
    req.body.taskU = fi + req.body.taskID;
    const { taskID, taskU, taskName, taskType, details } = req.body;
    const newTask = new Task({
        taskID,
        taskU,
        taskName,
        taskType,
        details
    })
    await newTask.save()
    res.redirect('managetask');
})

// deleting task

app.get('/managetask/:id', async (req, res) => {
    const task = await Task.findById(req.params.id)
    res.render('taskshow', { task });
})

app.delete('/managetask/:id', async (req, res) => {
    const { id } = req.params;
    await Task.findByIdAndDelete(id);
    console.log(id);
    res.redirect('/managetask');
});


const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`port is at ${port}`);
});