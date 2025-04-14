const express = require('express');
const router = express.Router();
const connection = require('../database');
const bcrypt = require('bcrypt');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userDir = `uploads/${req.session.userId}`;
        fs.mkdirSync(userDir, { recursive: true }); // Создаем папку пользователя, если она не существует
        cb(null, userDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Используем оригинальное имя файла
    }
});
const upload = multer({ storage });

// Список Аватарок 
const avatars = [
    { url: '/images/xxx.png' },
    { url: '/images/ччч.jpg' }
];

// // Главная страница
// router.get('/', (req, res) => {
//     res.render('layout', {
//         body: 'games',
//     })
// });
// Страница с играми
router.get('/', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    const session_id = req.session.userId
    connection.GetGames(session_id, (err, results) => {
        if (err) {
            return res.status(500).send('Ошибка при получении игр');
        }
        res.render('layout', { body: 'games', games: results }); // Ваша страница с играми
    });
});

// Форма создания новой игры
router.get('/add', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Если пользователь не авторизован, перенаправляем на страницу логина
    }
    res.render('layout',{body:'addGame'}); // Ваша EJS форма для добавления игры
});

// Обработка формы добавления игры
router.post('/add', upload.single('image'), (req, res) => {
    const { title, description } = req.body;
    const imagePath = `/${req.session.userId}/${req.file.originalname}`;
    const session_id = req.session.userId
    // Записываем информацию об игре в БД
    connection.AddGame(session_id, title, description, imagePath, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при добавлении игры');
        }
        res.redirect('/games'); // Перенаправляем на страницу с играми
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
        return res.render('layout', { error: 'Все заполнить надо!', body: 'register' });
    };
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if(!emailRegex.test(email)){
        return res.render('layout', { error: 'Ты не знаешь как мыло пишется?', body: 'register' });
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
            connection.createUser(username, hashedPassword, email, (err, results) => {
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

//Выбор аватарки
router.get('/select_thumbnail',(req,res) => {
    res.render('layout',{ body: 'select_avatar', avatars: avatars})
})

//
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



module.exports = router;