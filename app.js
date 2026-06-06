const express = require('express');
const session = require('express-session');
const path = require('path');

const app = express();
const indexRouter = require('./routes/index');
const connection = require('./database');

// Настройка шаблонов
app.set('view engine', 'ejs');
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'uploads')]);

// Статические файлы
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Сессия
app.use(session({
    secret: 'yourSecret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 * 24 } // 24 минуты
}));

// Глобальные вспомогательные функции для шаблонов
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.formatDiscountDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };
    res.locals.calculateTimeLeft = (endDate) => {
        if (!endDate) return '';
        const now = new Date();
        const end = new Date(endDate);
        const diff = end - now;
        if (diff <= 0) return 'Акция закончилась';
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        if (days > 0) return `Осталось ${days}д ${hours}ч`;
        if (hours > 0) return `Осталось ${hours}ч ${minutes}м`;
        return `Осталось ${minutes}м`;
    };
    next();
});

// ===================== ГЛОБАЛЬНЫЕ ДАННЫЕ ДЛЯ ВСЕХ СТРАНИЦ =====================
// 1. Категории (кешируем раз в минуту, но для простоты загружаем каждый раз)
app.use((req, res, next) => {
    connection.getAllCategoriesFull((err, categories) => {
        if (err) {
            console.error('Ошибка загрузки категорий:', err);
            res.locals.categoriesMenu = [];
        } else {
            res.locals.categoriesMenu = categories;
        }
        next();
    });
});

// 2. Данные авторизованного пользователя (избранное, корзина, счётчики)
app.use((req, res, next) => {
    if (!req.session.userId) {
        res.locals.userFavorites = [];
        res.locals.userCart = {};
        res.locals.userFavoritesCount = 0;
        res.locals.userCartCount = 0;
        return next();
    }

    // Получаем избранное и корзину одним запросом (два параллельных)
    const userId = req.session.userId;
    Promise.all([
        new Promise((resolve) => {
            connection.getFavoritesByCustomerID(userId, (err, favs) => resolve(err ? [] : favs));
        }),
        new Promise((resolve) => {
            connection.getCartByCustomerID(userId, (err, cart) => resolve(err ? [] : cart));
        })
    ]).then(([favorites, cartItems]) => {
        // Формируем данные для локальных переменных
        const favoritesIds = favorites.map(item => item.productID);
        const cartMap = {};
        let cartCount = 0;
        cartItems.forEach(item => {
            cartMap[item.productID] = { sc_count: item.sc_count };
            cartCount += item.sc_count;
        });

        res.locals.userFavorites = favoritesIds;
        res.locals.userCart = cartMap;
        res.locals.userFavoritesCount = favoritesIds.length;
        res.locals.userCartCount = cartCount;

        // Синхронизируем сессию (на всякий случай)
        req.session.favorites = favoritesIds;
        req.session.cart = cartMap;
        req.session.cartCount = cartCount;

        next();
    }).catch(err => {
        console.error('Ошибка загрузки пользовательских данных:', err);
        res.locals.userFavorites = [];
        res.locals.userCart = {};
        res.locals.userFavoritesCount = 0;
        res.locals.userCartCount = 0;
        next();
    });
});

// Запуск планировщика (если не тест)
if (process.env.NODE_ENV !== 'test') {
    require('./cron');
}

// Подключаем маршруты
app.use('/', indexRouter);

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});