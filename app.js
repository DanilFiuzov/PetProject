const express = require('express');
const session = require('express-session');

const app = express();
const indexRouter = require('./routes/index');
const gamesRouter = require('./routes/games');
const connection = require('./database');
const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));
app.use(express.static('uploads'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'yourSecret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000*24 }
}));

app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

app.use('/', indexRouter);
app.use('/games', gamesRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

