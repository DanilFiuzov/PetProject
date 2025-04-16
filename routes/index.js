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
        fs.mkdirSync(userDir, { recursive: true });
        fs.mkdirSync(`uploads/${req.session.userId}/images`, { recursive: true });
        fs.mkdirSync(`uploads/${req.session.userId}/styles`, { recursive: true });
        fs.mkdirSync(`uploads/${req.session.userId}/routes`, { recursive: true }); 
        fs.mkdirSync(`uploads/${req.session.userId}/scripts`, { recursive: true });
        fs.mkdirSync(`uploads/${req.session.userId}/views`, { recursive: true });

        let uploadPath = userDir; // По умолчанию — корневая папка
        if (file.mimetype.startsWith('image/')) {
            uploadPath = `${userDir}/images`;
        } 
        else if (file.originalname.endsWith('.css') || file.mimetype.includes('css')) {
            uploadPath = `${userDir}/styles`;
        } 
        else if (file.originalname === 'route.js') {
            uploadPath = `${userDir}/routes`;
        }
        else if (file.originalname.endsWith('.js') || file.mimetype.includes('javascript')) {
            uploadPath = `${userDir}/scripts`;
        } 
        else if (file.originalname.endsWith('.ejs') || file.mimetype.includes('ejs')) {
            uploadPath = `${userDir}/views`;
        }
        cb(null, uploadPath);
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
        res.render('layout', { body: 'games', games: results });
    });
});

// Форма создания новой игры
router.get('/add', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Если пользователь не авторизован, перенаправляем на страницу логина
    }
    res.render('layout',{body:'addGame'}); 
});

// Обработка формы добавления игры
router.post('/add', upload.fields([
    { name: 'image', maxCount: 25 }, // maxCount: 25 для картинок
    { name: 'style', maxCount: 1 },
    { name: 'script', maxCount: 5 }, // maxCount: 5 для скриптов
    { name: 'route', maxCount: 1 },
    { name: 'view', maxCount: 5 } // maxCount: 5 для представлений
]), (req, res) => {
    const { title, description } = req.body;
    const session_id = req.session.userId
    let [
        view_files_array,
        image_files_array,
        script_files_array
    ] = [[], [], []];

    // Проверка наличия файлов представлений
    let view_files = req.files['view'];
    if (view_files && view_files.length > 5) {
        return res.render('layout', { body: 'addGame', global_error: 'Количество файлов ejs представлений не может превышать 5' });
    }
    if (view_files) {
        for (const element of view_files) {
            if (element.size > 2098576) {
                return res.render('layout', { body: 'addGame', global_error: `Файл ${element.originalname} весит более 2МБ` });
            }
            view_files_array.push(`${req.session.userId}/views/${element.originalname}`);
        }
    }

    // Проверка наличия картинок
    let image_files = req.files['image'];
    if (image_files && image_files.length > 25) {
        return res.render('layout', { body: 'addGame', global_error: 'Количество картинок не может превышать 25' });
    }
    if (image_files) {
        for (const element of image_files) {
            if (element.size > 10485760) {
                return res.render('layout', { body: 'addGame', global_error: `Файл ${element.originalname} весит более 10МБ` });
            }
            image_files_array.push(`${req.session.userId}/images/${element.originalname}`);
        }
    }

    // Проверка наличия скриптов
    let script_files = req.files['script'];
    if (script_files && script_files.length > 5) {
        return res.render('layout', { body: 'addGame', global_error: 'Количество файлов скриптов не может превышать 5' });
    }
    if (script_files) {
        for (const element of script_files) {
            if (element.size > 20971520) {
                return res.render('layout', { body: 'addGame', global_error: `Файл ${element.originalname} весит более 2МБ` });
            }
            script_files_array.push(`${req.session.userId}/scripts/${element.originalname}`);
        }
    }

    // Путь к загруженным файлам
    const imagePath = image_files_array.join(',');
    const cssFilePath = req.files['style'] ? `/${req.session.userId}/styles/${req.files['style'][0].originalname}` : null;
    const jsFilePath = script_files_array.join(',');
    const routeFilePath = req.files['route'] ? `/${req.session.userId}/routes/${req.files['route'][0].originalname}` : null;
    const viewFilePath = view_files_array.join(',');

    // Проверка, что файлы загружены
    if (!req.files) {
        return res.render('layout', { body: 'addGame', global_error: `Убедитесь что все файлы загружены. Даже если у вас например нет файлв стилей вам небходимо добавить пустой файл` });
    }

    // Записываем информацию об игре в БД
    connection.AddGame(session_id, title, description, imagePath, cssFilePath, jsFilePath, routeFilePath, viewFilePath, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при добавлении игры');
        }
        res.redirect('/'); // Перенаправляем на страницу с играми
    });
});

// Удаление игры
router.post('/delete/:id', (req, res) => {
    const gameId = req.params.id;
    const session_id = req.session.userId

    connection.DeleteGame(gameId, session_id, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при удалении игры');
        }
        res.redirect('/');
    });
});
// const viewsArray = result[0].viewFile.split(',');
//Игра
router.get('/game/:id', (req, res) => {
    const gameId = req.params.id;
    connection.SelectGame(gameId,(err,result) => {
        if (err || result.length === 0) {
            return res.render('layout',{global_error: 'Ошибка при данных получении игры', body: 'games'});
        }
        req.session.activeGameID = result[0].gameID
        res.render('layout', { 
            body: `${req.session.userId}/views/index.ejs`,
            result: result 
        });
    })
})


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
    if(password.length < 0){
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

router.post('/logoutandchange', (req, res) => {
    const logoutandchange = req.body.logoutandchange; // Получаем значение, нажатой кнопки
    const name_value = req.body.acc_label_name;
    const phone_value = req.body.acc_label_phone;
    const session_id = req.session.userId;
    if (!req.session.userId) {
        return res.redirect('/login'); // Если пользователь не авторизован, перенаправляем на страницу логина
    }

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
    if (!req.session.userId) {
        return res.redirect('/login'); // Если пользователь не авторизован, перенаправляем на страницу логина
    }
})

//
router.post('/upload', async (req, res) => {
    const avatarId = req.body.avatar; // Получаем ID выбранного аватара
    const avatar = avatars[avatarId].url;
    const session_id = req.session.userId;  
    if (!req.session.userId) {
        return res.redirect('/login'); // Если пользователь не авторизован, перенаправляем на страницу логина
    }

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