const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const indexRouter = require('./routes/index');
const connection = require('./database');


app.set('view engine', 'ejs');
app.set('views',[ 
    path.join(__dirname, 'views'),
    path.join(__dirname, 'uploads')
]);
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


app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on http://0.0.0.0:3000');
});
