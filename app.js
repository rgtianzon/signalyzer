const express = require("express");
const app = express();
const path = require("path");
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const moment = require('moment');
const m = moment();
const momenttz = require('moment-timezone');

// const passport = require('passport');
// const localStrategy = require('passport-local');

// roster management routes
// const rosmanagement = require('./routes/roster');
// app.use('/rosmanagement', rosmanagement);

const sessionOptions = { 
    secret: 'notagoodsecret', 
    resave: false, 
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 120,
        maxAge: 1000 * 60 * 120
    }
}

// connecting to database
const dbUrl = process.env.DB_URL || 'mongodb+srv://admin:TriskelioN12@cluster0.o9j4k.mongodb.net/signals?retryWrites=true&w=majority';
mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    .then(() => {
        console.log('connection open!');
    })
    .catch(() => {
    console.log('error');
    })

const Task = require('./models/tasks');
const Roster = require('./models/roster');
const Agenttask = require('./models/agenttasks');
const passport = require("passport");
const { request } = require("http");


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(session(sessionOptions));
app.use(flash());
// app.use(passport.initialize());
// app.use(passport.session);
// passport.use(new localStrategy(Roster.authenticate()));
// passport.serializeUser(Roster.serializeUser());
// passport.deserializeUser(Roster.deserializeUser());


app.get('/', async (req, res) => {
    const user = await Roster.findOne({userName: req.session.user_id});
    if (user) {
        if (user.isActive) {
            if (user.isAdmin) {
                res.redirect('/adminhome')
            } else {
                res.render('agenthome');
            }
        } else {
            res.render('home');
        }
    } else {
        res.render('home');
    }
});

//log in function
app.post('/', async (req, res) => {
    const { userName, password } = req.body
    const user = await Roster.findOne({ userName });
    const validpw = await bcrypt.compare(password, user.password)
    actUser = user
    if (validpw) {
        if (user.isActive) {
            // res.cookie('isActive', user.isActive);
            // res.cookie('user_id', user._id);
            req.session.user_id = user.userName;
            if (user.isAdmin) {
                // res.cookie('isAdmin', user.isAdmin);
                res.redirect('/adminhome')
            } else {
                res.render('agenthome')
            }
        } else {
            res.render('home')
        }
    } else {
        res.render('home')
    }
});

app.get('/agenthome', async (req, res) => {
    const user = await Roster.findOne(req.session.user_id);
    if (user.isActive) {
        if (user.isAdmin) {
            res.redirect('/adminhome')
        } else {
            res.render('agenthome');
        }
    } else {
        res.redirect('/');
    }
});

// agents adding tasks

app.post('/addagenttask', async (req, res) => {
    const user = await Roster.findOne({userName: req.session.user_id});
    let random = Math.floor(Math.random()*999999) + 100001
    const agentTasksid = await Agenttask.findOne({taskID: random});
    while (agentTasksid !== null) {
        random = Math.floor(Math.random()*999999) + 100001
        console.log(random)
    }
    const fn = user.firstName + " " + user.lastName
    let Manila = momenttz.tz(new Date(), "Asia/Manila");
    const AgentTask = new Agenttask({
        taskID: random,
        userName: user.userName,
        fullName: fn,
        taskName: req.body.taskName,
        startDate: Manila.format('L LTS'),
        onGoing: true
    })
    await AgentTask.save()
        .then(() => {
            res.redirect('/');
        })
})

// agents update tasks

app.put('/agenttaskput', async (req, res) => {
    const tid = req.body.taskID;
    const coms = req.body.comments;
    const user = await Roster.findOne({userName: req.session.user_id});
    // duration start

    const endtak = momenttz.tz(new Date(), "Asia/Manila");
    const endDate = endtak.format('L LTS')
    const aTask = await Agenttask.findOne({taskID: tid});
    const taskStart = new Date(aTask.startDate).getTime();
    const taskEnd = new Date(endDate).getTime();
    const distance = taskEnd - taskStart;
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);
    const durationTime = hours + 'h ' + minutes + 'm ' + seconds + 's'

    // duration end
    const filter = { taskID: tid };
    const update = { 
        onGoing: false,
        endDate,
        durationTime,
        durationHr: hours,
        durationMn: minutes,
        durationSc: seconds,
        comments: coms,
        UpdatedBy: user.userName
    };
    await Agenttask.findOneAndUpdate(filter, update);
    // console.log(req.body.taskID);
    // Agenttask.findByIdAndUpdate()
    // console.log(id)
    res.redirect('/')
})

app.post('/logout', (req, res) => {
    req.session.user_id = null;
    res.redirect('/');
})

// admin routes

app.get('/adminhome', async (req, res) => {
    const user = await Roster.findOne({userName: req.session.user_id});
    const agentTasks = await Agenttask.find({userName: req.session.user_id}).sort({created_at: -1});
    const ongoingTasks = await Agenttask.find({userName: req.session.user_id, onGoing: true}).sort({created_at: -1});
    const endedTasks = await Agenttask.find({userName: req.session.user_id, onGoing: false}).sort({created_at: -1});
    if (user.isActive && user.isAdmin) {
        const npd = await Task.find({taskType: 'Non-Project Delivery'})
        const pd = await Task.find({taskType: 'Project Delivery'})
        res.render('adminhome', { npd, pd, user, agentTasks, ongoingTasks, endedTasks})
    } else {
        res.redirect('/')
    }
});

// router management route

app.get('/rostermanagement', async (req, res) => {
    const roster = await Roster.find({})
    res.render('rostermanagement', { roster });
})

// adding user

app.post('/rostermanagement', async (req, res) => {
    const roster = await Roster.find({})
    req.body.sigID = roster[roster.length - 1].sigID + 1;
    const existUserName = await Roster.find({userName: req.body.userName});
    if (existUserName[0] == null) {
        const { sigID, firstName, lastName, userName, password, isActive, isAdmin } = req.body;
        const hash = await bcrypt.hash(password, 12);
        const user = new Roster({
            sigID,
            firstName,
            lastName,
            userName,
            password: hash,
            isActive,
            isAdmin
        })
        await user.save()
            .then(() => {
            res.redirect('/rostermanagement')
        })
    } else {
        res.send(`Username ${req.body.userName} is already taken!`)
    }
})

//edit user

app.get('/edituser', (req, res) => {
    res.render('rmedituser');
})

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

