const express = require('express');
const router = express.Router();
const connection = require('../database');
const bcrypt = require('bcrypt');
const session = require('express-session');

// Главная страница
router.get('/', (req, res) => {
    var sqlres
    connection.CardGenerator(sqlres, (err, results) =>{
        if (err){
            console.error(err);
        }
        res.render('layout', {
            sqlres: results,
            body: 'index',
            input_price_value: 10000,
            selected_categories: ('')
        })
    })
});

// Список Аватарок 
const avatars = [
    { url: '/images/xxx.png' },
    { url: '/images/ччч.jpg' }
];

// Вход (GET)
router.get('/login', (req, res) => {
    res.render('layout', {body: 'login'});
});

// Вход (GET)
router.get('/register', (req, res) => {
    res.render('layout', {body: 'register'});
});

// Регистрация (POST)
router.post('/register', (req, res) => {
    const { username, password, email, phone, confirmpassword } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    // Проверяем, что username, password и email не пустые
    if (!username || !password || !email || !confirmpassword || !phone.length==11 ) {
        return res.render('layout', { error: 'Все заполнить надо!', body: 'register' });
    };
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if(!emailRegex.test(email)){
        return res.render('layout', { error: 'Ты не знаешь как мыло пишется?', body: 'register' });
    };
    const phoneRedex = /^\+?[0-9]{10,15}$/;
    if(!phoneRedex.test(phone)){
        return res.render('layout', { error: 'номерок это что-то типо "88005553535"', body: 'register' });
    };
    if(password.length < 8){
        return res.render('layout', { error: 'Хотябы 8 циферок напиши', body: 'register' });
    };
    if(password !== confirmpassword){
        return res.render('layout', { error: 'Не совпадают секретные циферки', body: 'register' });
    };
    connection.findUserByUsername(email, (err, results) => {
        if(Object.keys(results).length > 0){
            console.error(err);
            return res.render('layout', { error: 'Такой пользователь уже есть', body: 'register'});
        }
        else{
            connection.createUser(username, hashedPassword, email, phone, (err, results) => {
            if (err) {
                console.error(err);
                return res.render('layout', { error: 'Ошибка при регистрации.', body: 'register' });
            }
            res.redirect('/');
            }); 
        }
    })   
});

// Вход (POST)
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Проверяем, что username и password не пустые
    if (!email || !password) {
        return res.render('layout', { error: 'Все заполнить надо!', body: 'login' });
    }


    // Поиск пользователя по имени
    connection.findUserByUsername(email, (err, results) => {
        if (err) {
            console.error(err);
            return res.render('layout', { error: 'Ошибка при входе.', body: 'login' });
        }

        // Проверяем наличие пользователя с таким именем
        if (results.length > 0) {
            const user = results[0];
            // Проверяем переданный пароль с хэшем
            const isMatch = bcrypt.compareSync(password, user.customerPassword); // здесь происходит сравнение
            if (isMatch) {
                req.session.userId = user.customerID;  // Сохранение userId в сессии
                req.session.userThumbnail = user.customerThumbnail;
                req.session.userEmail = user.customerEmail;
                req.session.userRank = user.customerRank;
                req.session.userName = user.customerName;
                req.session.userPhone = user.customerPhone;
                res.redirect('/');
            } else {
                return res.render('layout', { error: 'Все таки забыл дароль, да?', body: 'login' });
            }
        } else {
            return res.render('layout', { error: 'Такого не знаем', body: 'login'});
        }
    });
});

router.get('/acc_page', (req, res) => {
    const session_id = req.session.userId

    connection.AccPageRender(session_id, (err,result) => {
        if(err){
            return res.render('layout', { error: 'Ошибка входа', body: 'index'});
        }
        else{
            res.render('layout', {body: 'acc_page', session_data: result})
        }
    })
})

router.post('/update_cat', (req, res) => {
    const { categories, price_value } = req.body;
    var category_list = ['1','2','3']

    let selectedCategories = Array.isArray(categories) ? categories : [categories];

    if (!categories && price_value == 10000) {
        res.redirect('/');
    } else if (price_value == 10000) {
        connection.CardGeneratorCatAndPrise(selectedCategories, price_value, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.render('layout', {
                    sqlres: result,
                    body: 'index',
                    input_price_value: price_value,
                    selected_categories: selectedCategories
                });
            }
        });
    } else if (!categories) {
        selectedCategories = category_list
        connection.CardGeneratorCatAndPrise(selectedCategories, price_value, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.render('layout', {
                    sqlres: result,
                    body: 'index',
                    input_price_value: price_value,
                    selected_categories: ('')
                });
            }
        });
    } else {
        connection.CardGeneratorCatAndPrise(selectedCategories, price_value, (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.render('layout', {
                    sqlres: result,
                    body: 'index',
                    input_price_value: price_value,
                    selected_categories: selectedCategories
                });
            }
        });
    }
});

router.post('/logoutandchange', (req, res) => {
    const logoutandchange = req.body.logoutandchange; // Получаем значение, нажатой кнопки
    const name_value = req.body.acc_label_name;
    const phone_value = req.body.acc_label_phone;
    const session_id = req.session.userId;

    switch (logoutandchange) {
        case 'logout':
            req.session.destroy(err => {
                if (err) {
                    return res.redirect('/'); // Ошибка при выходе
                }
                res.redirect('/'); // Успешный выход
            });
            break;
        case 'update':
            connection.UpdateNameandPhone(name_value,phone_value,session_id,(err,result) => {
                if(err){
                    console.log(err)
                    res.render('layout', {error:"Ошибка", body:'acc_page'})
                }
                else{
                    req.session.userName = name_value
                    req.session.userPhone = phone_value
                    res.redirect('/acc_page')
                }
            })
            break;
        default:
            console.log('Неизвестное действие');
    }




});

router.post('/add_to_cart', (req, res) => {
    const { name, price } = req.body;

    if (!req.session.cart) {
        req.session.cart = [];
    }

    // Добавление товара в корзину
    req.session.cart.push({ name, price });
    res.json({ message: 'Товар добавлен в корзину', cart: req.session.cart });
});

router.get('/select_thumbnail',(req,res) => {
    res.render('layout',{ body: 'select_avatar', avatars: avatars})
})

router.post('/upload', async (req, res) => {
    const avatarId = req.body.avatar; // Получаем ID выбранного аватара
    const avatar = avatars[avatarId].url;
    const session_id = req.session.userId;  
    connection.UpdateAvatar(avatar,session_id ,(err,result) => {
        if(err){
            console.log(err);
            return res.render('layout', { error: 'Ошибка', body: 'acc_page'});
        }
        else{
            req.session.userThumbnail = avatar
            res.redirect('/acc_page')
        }
    })
});

//Переход на страницу товара
router.post('/product', (req, res) => {
    const productId = req.body.productId;
    res.redirect(`/product/${productId}`);
});

// Страница товара
router.get('/product/:productId', (req, res) => {
    const product_id = req.params.productId

    connection.SelectedCardGenerator(product_id ,(err,result) => {
        if(err){
            console.log(err);
            return res.render('layout', { error: 'Ошибка', body: 'index'});
        }
        else{
            res.render('layout', { sqlres: result, body: 'product'})
        }
    })
});

router.post('/add_to_cart', (req, res) => {
    const { name, price } = req.body;

    // Инициализация корзины, если она еще не существует
    if (!req.session.cart) {
        req.session.cart = {};
    }

    // Если товар уже в корзине, увеличиваем его количество
    if (req.session.cart[name]) {
        req.session.cart[name].quantity += 1;
    } else {
        // Иначе добавляем новый товар в корзину
        req.session.cart[name] = {
            price: price,
            quantity: 1,
        };
    }

    res.json({ message: 'Товар добавлен в корзину', cart: req.session.cart });
});

// Обработчик для получения корзины
router.get('/cart', (req, res) => {
    res.json(req.session.cart || {});
});


router.get('/accept',(req, res) => {
    res.render('layout',{body: 'accept'})
})

module.exports = router;