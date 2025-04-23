const express = require('express');
const router = express.Router();
const connection = require('../database');
const bcrypt = require('bcrypt');
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

// Список Аватарок по умолчанию 
const avatars = [
    { url: '/images/Avatars/Thumbnail_1.jpg' },
    { url: '/images/Avatars/Thumbnail_2.png' },
    { url: '/images/Avatars/Thumbnail_3.jpg' },
    { url: '/images/Avatars/Thumbnail_4.png' },
    { url: '/images/Avatars/Thumbnail_5.jpg' },
    { url: '/images/Avatars/Thumbnail_6.png' }
];

//Главная страница
router.get('/', (req, res) => {
    connection.GetGames((err, results) => {
        if (err) {
            return res.status(500).send('Ошибка при получении игр');
        }
        res.render('layout', { body: 'games', games: results });
    });
});

// Форма создания новой игры
router.get('/add', (req, res) => {
    if (!req.session.userId || req.session.userRank !== 'Разработчик') {
        return res.redirect('/login'); // Если пользователь не авторизован, перенаправляем на страницу логина
    }
    res.render('layout',{body:'addGame'}); 
});

// Обработка формы добавления игры
router.post('/add', upload.fields([
    { name: 'image', maxCount: 25 }, // maxCount: 25 для картинок
    { name: 'style', maxCount: 5 }, // maxCount: 5 для стилей
    { name: 'script', maxCount: 5 }, // maxCount: 5 для скриптов
    { name: 'route', maxCount: 1 }, // maxCount: 1 для роутинга
    { name: 'view', maxCount: 5 } // maxCount: 5 для представлений
]), (req, res) => {
    const { title, description } = req.body;
    const session_id = req.session.userId
    let [
        view_files_array,
        image_files_array,
        script_files_array,
        css_files_array
    ] = [[], [], [], []];

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

    let css_files = req.files['style'];
    if (css_files && css_files.length > 5) {
        return res.render('layout', { body: 'addGame', global_error: 'Количество файлов стилей не может превышать 5' });
    }
    if (css_files) {
        for (const element of css_files) {
            if (element.size > 20971520) {
                return res.render('layout', { body: 'addGame', global_error: `Файл ${element.originalname} весит более 2МБ` });
            }
            css_files_array.push(`${req.session.userId}/styles/${element.originalname}`);
        }
    }

    // Путь к загруженным файлам
    const imagePath = image_files_array.join(',');
    const cssFilePath = css_files_array.join(',');
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
        else{
            connection.GetDeveloperGames(session_id,(err,result) => {
                if(err){
                    console.log(err)
                    return res.render("layout",{body:'acc_page', global_error: 'Ошибка при получении данных игры'})
                }
                else{
                    res.render("layout",{body:'mygame', games:result})
                }
            })
        }
    });
});
// const viewsArray = result[0].viewFile.split(',');

//Игра
router.get('/game/:id', (req, res) => {
    const gameId = req.params.id;
    if(!req.session.userId){
        res.redirect('/login')
    }
    else{
        const session_id = req.session.userId
        connection.SelectWinLoss(session_id, gameId,(err,winloss_result) => {
            if(err){
                console.log(err)
                return res.render('layout',{global_error: 'Ошибка при получении данных игры', body: 'games'});
            }
            else if (winloss_result.length<1){
                connection.AddEmpty(session_id,gameId,(err) => {
                    if (err) {
                        console.log(err)
                        return res.render('layout',{global_error: 'Ошибка при получении данных игры', body: 'games'});
                    }
                    else{
                        connection.SelectGame(gameId,(err,result) => {
                            if (err) {
                                console.log(err)
                                return res.render('layout',{global_error: 'Ошибка при получении данных игры', body: 'games'});
                            }
                            else{
                                connection.SelectWinLoss(session_id,gameId,(err,winloss_result) => {
                                    if(err){

                                    }
                                    else{
                                        req.session.activeGameID = result[0].gameID
                                        req.session.SelectGameWins = winloss_result[0].wins
                                        req.session.SelectGameLosses = winloss_result[0].losses
                                        req.session.SelectGameDraws = winloss_result[0].draws
                                        req.session.SelectGameScore = winloss_result[0].score
                                        res.render(`${result[0].customerID}/views/index.ejs`, { result: result });
                                    }
                                })
                            }
                        })
                    }
                })
            }
            else{
                connection.SelectGame(gameId,(err,result) => {
                    if (err || result.length === 0) {
                        console.log(err)
                        return res.render('layout',{global_error: 'Ошибка при получении данных игры', body: 'games'});
                    }
                    req.session.activeGameID = result[0].gameID
                    req.session.SelectGameWins = winloss_result[0].wins
                    req.session.SelectGameLosses = winloss_result[0].losses
                    res.render(`${result[0].customerID}/views/index.ejs`, { result: result });
                })
            }
        })
    }
})

router.get('/edit/:id', (req, res) =>{
    const gameId = req.params.id;
    if (!req.session.userId || req.session.userRank !== 'Разработчик') {
        return res.redirect('/login'); // Если пользователь не авторизован, перенаправляем на страницу логина
    }
    else{
        connection.SelectGame(gameId,(err,result) => {
            if(err){
                console.log(err)
                return res.render('layout', {body: 'mygames', global_error: "Ошибка при получении данных игры"})
            }
            else{
                res.render('layout',{body:'editGame',games: result});
            }
        })
    }
});

router.post('/edit/:id', upload.fields([
    { name: 'image', maxCount: 25 },
    { name: 'style', maxCount: 5 },
    { name: 'script', maxCount: 5 },
    { name: 'route', maxCount: 1 },
    { name: 'view', maxCount: 5 }
]), (req, res) => {
    const gameId = req.params.id;
    let { title, description } = req.body;
    const session_id = req.session.userId;

    let [
        view_files_array,
        image_files_array,
        script_files_array,
        css_files_array
    ] = [[], [], [], []];

    // Получение данных об игре из базы данных
    connection.SelectGame(gameId, (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect(`/edit/${gameId}`);
        }

        // Получение текущих файлов из базы данных
        const oldViewFiles = result[0].viewFile.split(',');
        const oldImageFiles = result[0].gameImage.split(',');
        const oldScriptFiles = result[0].jsFile.split(',');
        const oldCssFiles = result[0].cssFile.split(',');
        const oldRouteFile = result[0].routeFile;


        // Проверка и обработка файлов представлений
        let view_files = req.files['view'];
        if (view_files && view_files.length > 5) {
            return res.render('layout', { body: 'addGame', global_error: 'Количество файлов ejs представлений не может превышать 5' });
        }
        else if(!view_files){
            view_files_array = oldViewFiles;
        }
        else {
            for (const element of view_files) {
                if (element.size > 2098576) {
                    return res.render('layout', { body: 'addGame', global_error: `Файл ${element.originalname} весит более 2МБ` });
                }
                view_files_array.push(`${req.session.userId}/views/${element.originalname}`);
            }
        }

        // Выполняем сравнение
        if (view_files_array.toString() !== oldViewFiles.toString()) {
            // Удаление старых файлов представлений
            removeFilesFromDirectory(oldViewFiles);
        } else {
            // Если не изменилось, сохраняем старые файлы
            view_files_array = oldViewFiles;
        }

        // Проверка и обработка изображений
        let image_files = req.files['image'];
        if (image_files && image_files.length > 25) {
            return res.render('layout', { body: 'addGame', global_error: 'Количество картинок не может превышать 25' });
        }
        else if(!image_files){
            image_files_array = oldImageFiles;
        }
        else {
            for (const element of image_files) {
                if (element.size > 10485760) {
                    return res.render('layout', { body: 'addGame', global_error: `Файл ${element.originalname} весит более 10МБ` });
                }
                image_files_array.push(`${req.session.userId}/images/${element.originalname}`);
            }
        }

        // Сравнение для изображений
        if (image_files_array.toString() !== oldImageFiles.toString()) {
            removeFilesFromDirectory(oldImageFiles);
        } else {
            image_files_array = oldImageFiles;
        }

        // Проверка и обработка скриптов
        let script_files = req.files['script'];
        if (script_files && script_files.length > 5) {
            return res.render('layout', { body: 'addGame', global_error: 'Количество файлов скриптов не может превышать 5' });
        }
        else if(!script_files){
            script_files_array = oldScriptFiles;
        }
        else{
            for (const element of script_files) {
                if (element.size > 20971520) {
                    return res.render('layout', { body: 'addGame', global_error: `Файл ${element.originalname} весит более 20МБ` });
                }
                script_files_array.push(`${req.session.userId}/scripts/${element.originalname}`);
            }
        }
        // Сравнение для скриптов
        if (script_files_array.toString() !== oldScriptFiles.toString()) {
            removeFilesFromDirectory(oldScriptFiles);
        } else {
            script_files_array = oldScriptFiles;
        }

        // Проверка и обработка стилей
        let css_files = req.files['style'];
        if (css_files && css_files.length > 5) {
            return res.render('layout', { body: 'addGame', global_error: 'Количество файлов стилей не может превышать 5' });
        }
        else if(!css_files){
            css_files_array = oldCssFiles;
        }
        else {
            for (const element of css_files) {
                if (element.size > 20971520) {
                    return res.render('layout', { body: 'addGame', global_error: `Файл ${element.originalname} весит более 20МБ` });
                }
                css_files_array.push(`${req.session.userId}/styles/${element.originalname}`);
            }
        }

        // Сравнение для стилей
        if (css_files_array.toString() !== oldCssFiles.toString()) {
            removeFilesFromDirectory(oldCssFiles);
        } else {
            css_files_array = oldCssFiles;
        }

        if(!title){
            title = result[0].gameTitle
        }
        if(!description){
            description = result[0].gameDescription
        }

        // Путь к загруженным файлам
        const imagePath = image_files_array.join(',');
        const cssFilePath = css_files_array.join(',');
        const jsFilePath = script_files_array.join(',');
        const routeFilePath = req.files['route'] ? `/${req.session.userId}/routes/${req.files['route'][0].originalname}` : oldRouteFile;
        const viewFilePath = view_files_array.join(',');



        // Записываем информацию об игре в БД
        connection.UpdateGame(title, description, imagePath, cssFilePath, jsFilePath, routeFilePath, viewFilePath,session_id, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Ошибка при изменении игры');
            }
            res.redirect('/acc_page'); // Перенаправляем на страницу с играми
        });
    });
});

// Функция для удаления файлов из папки
const removeFilesFromDirectory = (files) => {
    try {
        // Читаем файлы в папке
        const existingFiles = fs.readdirSync("./uploads/"+files);

        // Удаляем только те файлы, что есть в текущем массиве файлов
        files.forEach(file => {
            const filePath = path.join("./uploads/"+file);
            if (existingFiles.includes(file)) {
                fs.unlinkSync(filePath);
                console.log(`Файл ${filePath} удален.`);
            }
        });

        console.log(`Все файлы из ${"."+directoryPath} удалены!`);
    } catch (err) {
        console.error('Ошибка:', err);
    }
}

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
    if(username.length > 16){
        return res.render('layout', { error: 'Ник не может быть более 16 символов', body: 'register' });
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
                let session_id = user.customerID
                connection.CountGames(session_id,(err,countgames) =>{
                    req.session.userCountGames = countgames.length
                    req.session.userId = user.customerID;
                    req.session.userThumbnail = user.customerThumbnail;
                    req.session.userEmail = user.customerEmail;
                    req.session.userRank = user.customerRank;
                    req.session.userName = user.customerName;
                    res.redirect('/');
                })
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
            connection.UpdateNameandPhone(name_value,session_id,(err,result) => {
                if(err){
                    console.log(err)
                    res.render('layout', {global_error:"Ошибка", body:'acc_page'})
                }
                else{
                    if(name_value.length > 16){
                        console.log(err)
                        return res.render('layout',{body:'acc_page',global_error: "Ник не может быть более 16 символов"})
                    }
                    else{
                        req.session.userName = name_value
                        res.redirect('/acc_page')
                    }
                }
            })
            break;
        case 'mygame':
            connection.GetDeveloperGames(session_id,(err,result) => {
                if(err){
                    console.log(err)
                    return res.render("layout",{body:'acc_page', global_error: 'Ошибка при получении данных игры'})
                }
                else{
                    res.render("layout",{body:'mygame', games:result})
                }
            })
            break;
        default:
            console.log('Неизвестное действие');
            return res.render("layout",{body:'acc_page', global_error: 'Ошибка'})
    }
});

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

//
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
            return res.render('layout', { error: 'Ошибка', body: 'acc_page'});
        }
        else{
            req.session.userThumbnail = avatar
            res.redirect('/acc_page')
        }
    })
});



module.exports = router;