const express = require("express");
const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`port is at ${port}`);
});