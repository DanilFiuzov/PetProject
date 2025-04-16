const express = require('express');
const session = require('express-session');

const app = express();
const indexRouter = require('./routes/index');
const connection = require('./database');
const path = require('path');

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

app.use('/game/:id', (req, res, next) => {
    const gameId = req.params.id;

    // Загружаем роутиг текущей игры
    const gameRoutePath = `./uploads/${req.session.userId}/routes/route`
    try {
        const gameRouter = require(gameRoutePath);
        app.use(`/game/${gameId}`, gameRouter); // Подключаем только маршруты активной игры
        next(); // Переход к следующему middleware
    } catch (error) {
        console.error(`Ошибка при подключении маршрута для игры ${gameId}: ${error.message}`);
        res.status(404).send('Маршрут для этой игры не найден.');
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

