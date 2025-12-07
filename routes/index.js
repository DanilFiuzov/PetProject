const express = require('express');
const router = express.Router();
const connection = require('../database');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');


// Глобальный массив для хранения аватарок
let avatars = [];
// Функция для загрузки аватарок из файловой системы
const loadAvatars = () => {
    // Используйте __dirname для указания абсолютного пути к директории с аватарами
    const avatarsDir = path.join(__dirname, '../public/images/Avatars'); // Поднимаемся на уровень выше, чтобы достигнуть 'public'
    console.log('Путь к директории аватарок:', avatarsDir);
    
    // Проверяем существование директории
    if (!fs.existsSync(avatarsDir)) {
        console.error('Папка с аватарами не найдена:', avatarsDir);
        return;
    }

    fs.readdir(avatarsDir, (err, files) => {
        if (err) {
            console.error('Ошибка при чтении директории аватарок:', err);
            return;
        }

        // Формируем массив аватарок
        avatars = files.map(file => ({
            url: `/images/Avatars/${file}`
        }));
    });
};
// Загружаем аватарки при запуске сервера
loadAvatars();

// Главная страница
router.get('/', (req, res) => {
    // Получаем все продукты из базы данных
    connection.GetProducts((err, products) => {
        if (err) {
            return res.status(500).send('Ошибка при получении списка продуктов');
        }

        // Проверяем, вошел ли пользователь
        if (req.session.userId) {
            // Получаем избранные товары для текущего пользователя
            connection.getFavoritesByCustomerID(req.session.userId, (err, favorites) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Ошибка при получении избранных товаров');
                }

                // Обновляем массив избранных товаров в сессии
                req.session.favorites = favorites.map(item => item.productID); // Сохраняем только productID
                
                // Обновляем массив товаров в корзине из базы данных
                connection.getCartByCustomerID(req.session.userId, (err, cartItems) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Ошибка при получении товаров из корзины');
                    }
                    req.session.cart = cartItems.map(item => item.productID); // Сохраняем только productID
                    // Отправляем данные на рендеринг
                    res.render('layout', { body: 'products', products: products, session: req.session });
                });
            });
        } else {
            // Если пользователь не вошел, просто передаем все продукты
            res.render('layout', { body: 'products', products: products, session: req.session });
        }
    });
});

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
    const { username, password, email, confirmpassword } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    // Проверяем, что username, password и email не пустые
    if (!username || !password || !email || !confirmpassword) {
        return res.render('layout', { error: 'Заполните все поля!', body: 'register' });
    };
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if(!emailRegex.test(email)){
        return res.render('layout', { error: 'Неверный email!', body: 'register' });
    };
    if(password.length < 0){
        return res.render('layout', { error: 'Пароль не может быть меньше 8 символов!', body: 'register' });
    };
    if(username.length > 16){
        return res.render('layout', { error: 'Псевдоним не может быть больше 16 символов!', body: 'register' });
    };
    if(password !== confirmpassword){
        return res.render('layout', { error: "Пароли не совпадают!", body: 'register' });
    };
    connection.findUserByUsername(email, (err, results) => {
        if(Object.keys(results).length > 0){
            console.error(err);
            return res.render('layout', { error: 'Такой пользователь уже есть!', body: 'register'});
        }
        else{
            connection.createUser(username, hashedPassword, email, (err, results) => {
            if (err) {
                console.error(err);
                return res.render('layout', { error: 'Ошибка во время регистрации!', body: 'register' });
            }
            res.redirect('/');
            }); 
        }
    })   
});

// Вход (POST)
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.render('layout', { error: 'Заполните все поля!', body: 'login' });
    }

    connection.findUserByUsername(email, (err, results) => {
        if (err) {
            console.error(err);
            return res.render('layout', { error: 'Ошибка во время авторизации.', body: 'login' });
        }

        if (results.length > 0) {
            const user = results[0];
            const isMatch = bcrypt.compareSync(password, user.customerPassword);
            if (isMatch) {
                req.session.userId = user.customerID;
                req.session.userThumbnail = user.customerThumbnail;
                req.session.userEmail = user.customerEmail;
                req.session.userName = user.customerName;

                // Получение избранных товаров и товаров в корзине после входа
                connection.getFavoritesByCustomerID(user.customerID, (err, favorites) => {
                    if (err) {
                        console.error(err);
                    } else {
                        req.session.favorites = favorites.map(item => item.productID); // Сохраняем в сессии
                    }
                });

                // Получаем товары из корзины
                connection.getCartByCustomerID(user.customerID, (err, cartItems) => {
                    if (err) {
                        console.error(err);
                    } else {
                        // Сохраняем информацию о товарах в корзине (productID и sc_count)
                        req.session.cart = {};
                        cartItems.forEach(item => {
                            req.session.cart[item.productID] = item.sc_count; // Сохраняем productID и количество в сессии
                        });
                    }
                    res.redirect('/');
                });
            } else {
                return res.render('layout', { error: 'Неверный пароль!', body: 'login' });
            }
        } else {
            return res.render('layout', { error: 'Такого пользователя не существует.', body: 'login' });
        }
    });
});

// Добавление товара в корзину
router.post('/cart/add', (req, res) => {
    const { productID } = req.body;
    const customerID = req.session.userId;

    // Проверка, авторизован ли пользователь
    if (!customerID) {
        return res.status(401).json({ success: false, message: 'Необходим вход в систему' });
    }

    // Инициализация корзины, если её ещё нет
    req.session.cart = req.session.cart || {};

    // Проверяем, существует ли товар в корзине
    if (req.session.cart[productID]) {
        // Увеличиваем количество
        req.session.cart[productID].sc_count = (req.session.cart[productID].sc_count || 0) + 1;

        // Обновляем корзину в базе данных
        connection.updateCartItem(customerID, productID, 'increase', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Ошибка при обновлении товара в корзине' });
            }

            // Обновляем количество товаров в сессии
            req.session.cartCount = Object.values(req.session.cart).reduce((total, item) => {
                return total + (item && item.sc_count ? item.sc_count : 0); // Убедитесь, что item не null и имеет sc_count
            }, 0);
            return res.json({ success: true, cartCount: req.session.cartCount });
        });
    } else {
        // Если товар добавляется впервые
        req.session.cart[productID] = { sc_count: 1 };  // Устанавливаем количество на 1

        // Добавляем товар в базу данных
        connection.addToCart(customerID, productID, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: 'Ошибка при добавлении товара в корзину' });
            }
            
            // Обновляем количество товаров в сессии
            req.session.cartCount = Object.values(req.session.cart).reduce((total, item) => {
                return total + (item && item.sc_count ? item.sc_count : 0); // Убедитесь, что item не null и имеет sc_count
            }, 0);
            return res.json({ success: true, cartCount: req.session.cartCount });
        });
    }
});



// Изменение количества товара в корзине
router.post('/cart/update', (req, res) => {
    const { productID, action } = req.body; // action может принимать значения 'increase' или 'decrease'
    const customerID = req.session.userId;

    if (!customerID) {
        return res.redirect('/login'); // Перенаправление на страницу входа
    }

    if (action === 'increase') {
        // Увеличиваем количество
        connection.updateCartItem(customerID, productID, 'increase', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Ошибка при увеличении количества товара в корзине');
            }
        });
    } else if (action === 'decrease') {
        // Уменьшаем количество
        connection.updateCartItem(customerID, productID, 'decrease', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Ошибка при уменьшении количества товара в корзине');
            }
        });
    }

    res.redirect('/cart/' + customerID); // Перенаправление обратно на страницу корзины
});

// Удаление товара из корзины
router.post('/cart/remove', (req, res) => {
    const { productID } = req.body;
    const customerID = req.session.userId;

    if (!customerID) {
        return res.redirect('/login'); // Перенаправление на страницу входа
    }

    connection.removeFromCart(customerID, productID, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при удалении товара из корзины');
        }
    });

    res.redirect('/cart/' + customerID); // Перенаправление обратно на страницу корзины
});

// Корзина пользователя
router.get('/cart/:userId', (req, res) => {
    const userId = req.params.userId;

    if (!req.session.userId) {
        return res.redirect('/login'); // Перенаправление на страницу авторизации
    }

    connection.getCartByCustomerID(userId, (err, cartItems) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при получении товаров из корзины');
        }

        const productMap = {};
        const productDetailsPromises = cartItems.map(item => {
            return new Promise((resolve, reject) => {
                connection.getProductByID(item.productID, (err, product) => {
                    if (err) return reject(err);
                    product.sc_count = item.sc_count; // Добавляем количество в информацию о продукте
                    productMap[product.productID] = product; // Используем его для группировки
                    resolve();
                });
            });
        });

        Promise.all(productDetailsPromises).then(() => {
            const products = Object.values(productMap); // Получаем массив с уникальными товарами
            res.render('layout', { body: 'cart', products: products, session: req.session });
        }).catch(err => {
            console.error(err);
            res.status(500).send('Ошибка при получении данных о продуктах');
        });
    });
});

// Маршрут для страницы товара
router.get('/product/:id', (req, res) => {
    const productID = req.params.id;

    connection.getProductByID(productID, (err, product) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при получении товара');
        }
        
        if (!product) {
            return res.status(404).send('Товар не найден');
        }

        res.render('layout', { product: product, session: req.session, body: 'product' }); // Отправляем данные на страницу товара
    });
});

// Добавление товара в избранное
router.post('/favorites/add', (req, res) => {
    const { productID } = req.body;
    const customerID = req.session.userId; // Идентификатор пользователя из сессии

    // Проверка, есть ли идентификатор пользователя и товара
    if (!customerID || !productID) {
        return res.status(400).send('Invalid request');
    }

    // Добавление товара в избранное
    connection.addToFavorites(productID, customerID, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error adding to favorites');
        }

        // Обновляем массив избранных товаров в сессии
        if (!req.session.favorites) {
            req.session.favorites = [];
        }
        req.session.favorites.push(productID); // Добавляем новый товар в массив

        res.status(200).send('Added to favorites');
    });
});

// Удаление товара из избранного
router.post('/favorites/remove', (req, res) => {
    const { productID } = req.body;
    const customerID = req.session.userId; // Идентификатор пользователя из сессии

    // Проверка, есть ли идентификатор пользователя и товара
    if (!customerID || !productID) {
        return res.status(400).send('Invalid request');
    }

    // Удаление товара из избранного
    connection.removeFromFavorites(productID, customerID, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error removing from favorites');
        }

        // Обновляем массив избранных товаров в сессии
        if (req.session.favorites) {
            req.session.favorites = req.session.favorites.filter(id => id !== productID); // Удаляем товар из массива
        }

        res.status(200).send('Removed from favorites');
    });
});

// Маршрут для получения страницы избранного
router.get('/favorites', (req, res) => {
    const customerID = req.session.userId;

    if (customerID) {
        connection.getFavoritesByCustomerID(customerID, (err, favorites) => {
            if (err) {
                return res.status(500).send('Ошибка при получении избранных товаров');
            }

            // Обновляем массив избранных товаров в сессии
            req.session.favorites = favorites.map(item => item.productID);

            // Выводим избранные товары
            res.render('layout', { products: favorites, body: 'favorites' });
        });
    } else {
        res.redirect('/login');
    }
});

//Страница аккаунта
router.get('/acc_page', (req, res) => {
    const session_id = req.session.userId
    if (!req.session.userId) {
        return res.redirect('/login'); // Если пользователь не авторизован, перенаправляем на страницу логина
    }

    connection.AccPageRender(session_id, (err,result) => {
        if(err){
            return res.render('layout', { error: 'Ошибка входа', body: 'index'});
        }
        else{
            res.render('layout', {body: 'acc_page', session_data: result})
        }
    })
})

//Выход и выбор
router.post('/logoutandchange', (req, res) => {
    const logoutandchange = req.body.logoutandchange; // Получаем значение, нажатой кнопки
    const name_value = req.body.acc_label_name;
    const session_id = req.session.userId;
    if (!req.session.userId) {
        return res.redirect('/login'); // Если пользователь не авторизован, перенаправляем на страницу логина
    }

    switch (logoutandchange) {
        case 'logout':
            res.redirect('/logout')
            break;
        case 'update':
            connection.UpdateName(name_value,session_id,(err,result) => {
                if(err){
                    console.log(err)
                    res.render('layout', {global_error:"Error", body:'acc_page'})
                }
                else{
                    if(name_value.length > 16){
                        console.log(err)
                        return res.render('layout',{body:'acc_page',global_error: "The nickname cannot be less than 16 characters!"})
                    }
                    else{
                        req.session.userName = name_value
                        res.redirect('/acc_page')
                    }
                }
            })
            break;
        default:
            return res.render("layout",{body:'acc_page', global_error: 'Error'})
    }
});

//Выход
router.get('/logout',(req, res) =>{
    if(req.session.userId){
        req.session.destroy(err => {
            if (err) {
                return res.render('layout', { body:games, global_error: "Ошибка при выходе"}); // Ошибка при выходе
            }
            res.redirect('/'); // Успешный выход
        });
    }
})

//Выбор аватарки
router.get('/select_thumbnail',(req,res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Если пользователь не авторизован, перенаправляем на страницу логина
    }
    res.render('layout',{ body: 'select_avatar', avatars: avatars})
})

//Замена аватарки
router.post('/upload', async (req, res) => {
    const session_id = req.session.userId;  
    if (!req.session.userId) {
        return res.redirect('/login'); // Если пользователь не авторизован, перенаправляем на страницу логина
    }
    const avatarId = req.body.avatar; // Получаем ID выбранного аватара
    const avatar = avatars[avatarId].url;

    connection.UpdateAvatar(avatar,session_id ,(err,result) => {
        if(err){
            console.log(err);
            return res.render('layout', { error: 'Error', body: 'acc_page'});
        }
        else{
            req.session.userThumbnail = avatar
            res.redirect('/acc_page')
        }
    })
});

module.exports = router;