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
    res.locals.formatDiscountDate = formatDiscountDate;
    res.locals.calculateTimeLeft = calculateTimeLeft;
    next();
});


// Функция для форматирования даты
function formatDiscountDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Функция для расчета времени до конца акции
function calculateTimeLeft(endDate) {
    if (!endDate) return '';
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    
    if (diff <= 0) return 'Акция закончилась';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
        return `Осталось ${days}д ${hours}ч`;
    } else if (hours > 0) {
        return `Осталось ${hours}ч ${minutes}м`;
    } else {
        return `Осталось ${minutes}м`;
    }
}


if (process.env.NODE_ENV !== 'test') {
    require('./cron');
}

app.use('/', indexRouter);


app.listen(3000, () => {
  console.log('Server running on http://0.0.0.0:3000');
});
