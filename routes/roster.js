const express = require("express");
const router = express.Router();

//roster management

router.get('/', async (req, res) => {
    const roster = await Roster.find({})
    res.render('rostermanagement', { roster });
})

router.post('/', async (req, res) => {
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

router.get('/edituser', (req, res) => {
    res.render('rmedituser');
})

module.exports = router;