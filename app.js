const express = require("express");
const app = express();
const path = require("path");
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const methodOverride = require('method-override');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
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
mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log('connection open!');
    })
    .catch(() => {
    console.log('error');
    })

const Task = require('./models/tasks');
const Roster = require('./models/roster');
const passport = require("passport");


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
    if (req.session.user_id) {
        if (req.session.user_id.isActive) {
            if (req.session.user_id.isAdmin) {
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

app.post('/logout', (req, res) => {
    req.session.user_id = null;
    res.redirect('/');
})

// admin routes

app.get('/adminhome', async (req, res) => {
    const user = await Roster.findOne({userName: req.session.user_id});
    if (user.isActive && user.isAdmin) {
        res.render('adminhome')
    } else {
        res.redirect('/')
    }
});

// router management route

app.get('/rostermanagement', async (req, res) => {
    const roster = await Roster.find({})
    res.render('rostermanagement', { roster });
})

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
    // res.render('rostermanagement', { roster });
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

