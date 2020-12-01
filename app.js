const express = require("express");
const app = express();
const path = require("path");

// app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.get('/', (req, res) => {
    res.render('home');
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`port is at ${port}`);
});