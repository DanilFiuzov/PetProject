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

// Достижения
const achievementsList = [
    { type: 'wins', Name: 'Побед 1', value: 1 , img: "/images/Achievements/1_Win.png"},
    { type: 'wins', Name: 'Побед 3', value: 3 , img: "/images/Achievements/3_Wins.png"},
    { type: 'wins', Name: 'Побед 5', value: 5 , img: "/images/Achievements/5_Wins.png"},
    { type: 'wins', Name: 'Побед 10', value: 10 , img: "/images/Achievements/10_Wins.png"},
    { type: 'losses', Name: 'Поражений 1', value: 1 , img: "/images/Achievements/1_Loss.png"},
    { type: 'losses', Name: 'Поражений 3', value: 3 , img: "/images/Achievements/3_Losses.png"},
    { type: 'losses', Name: 'Поражений 5', value: 5 , img: "/images/Achievements/5_Losses.png"},
    { type: 'losses', Name: 'Поражений 10', value: 10 , img: "/images/Achievements/10_Losses.png"},
    { type: 'score', Name: 'Счет 2500', value: 2500 , img: "/images/Achievements/2500_Score.png"},
    { type: 'score', Name: 'Счет 5000', value: 5000 , img: "/images/Achievements/5000_Score.png"},
    { type: 'score', Name: 'Счет 7500', value: 7500 , img: "/images/Achievements/7500_Score.png"},
    { type: 'score', Name: 'Счет 10000', value: 10000 , img: "/images/Achievements/10000_Score.png"},
    { type: 'draws', Name: 'Ничьих 1', value: 1 , img: "/images/Achievements/1_Draws.png"},
    { type: 'draws', Name: 'Ничьих 3', value: 3 , img: "/images/Achievements/3_Draws.png"},
    { type: 'draws', Name: 'Ничьих 5', value: 5 , img: "/images/Achievements/5_Draws.png"},
    { type: 'draws', Name: 'Ничьих 10', value: 10 , img: "/images/Achievements/10_Draws.png"},

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
        if(req.session.CountGames){
            req.session.CountGames = 1
        }
        res.redirect('/'); // Перенаправляем на страницу с играми
    });
});

// Удаление игры
router.post('/delete/:id', (req, res) => {
    const gameId = req.params.id;
    const session_id = req.session.userId

    const deleteFolder = (folderPath) => {
        fs.rmdir(folderPath, { recursive: true }, (err) => {
            if (err) {
                console.error('Ошибка при удалении папки:', err);
            } else {
                console.log('Папка удалена:', folderPath);
            }
        });
    };

    connection.DeleteGame(gameId, session_id, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при удалении игры');
        }
        else{
            const folderPath = path.join('./uploads', `${session_id}`);
            deleteFolder(folderPath); 
            if(req.session.CountGames){
                req.session.CountGames = req.session.CountGames-1
            }
            res.redirect('/acc_page')
        }
    });
});

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

//Страница изменения игры
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

// Функция для удаления файлов из папки
const removeFilesFromDirectory = (files) => {
    const uploadDir = path.join('./uploads');
    
    // Возвращаем промис для удаления файлов
    return Promise.all(files.map(file => {
        return new Promise((resolve, reject) => {
            const filePath = path.join(uploadDir, file);

            // Проверяем, является ли файл действительно файлом
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error(`Ошибка при проверке файла ${file}: ${err.message}`);
                    return reject(err);
                }

                if (stats.isFile()) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(`Ошибка при удалении файла ${file}: ${err.message}`);
                            return reject(err);
                        } else {
                            console.log(`Файл ${file} успешно удалён.`);
                            resolve();
                        }
                    });
                } else {
                    console.error(`${filePath} не является файлом.`);
                    resolve(); // Если это не файл, просто разрешаем промис
                }
            });
        });
    }));
};

//Удаление данных игры
router.post('/delete_data/:id',(req,res) => {
    let datafordelete = req.params.id.split("_")
    let data = datafordelete[0], gameId = datafordelete[1]
    
    connection.SelectGame(gameId,(err,result) => {
        if(err){
            console.log(err)
        }else{
            connection.DeleteGameData(data,gameId,(err) => {
                if(err){
                    console.log(err)
                }
                else{
                    if(result[0][data] !== null){
                    delete_data = result[0][data].split(",")
                    removeFilesFromDirectory(delete_data) 
                    }else{
                        console.log(err)
                    }
                }
            })         
        }
    })
})

//Форма изменения данных игры
router.post('/edit/:id', upload.fields([
    { name: 'image', maxCount: 25 },
    { name: 'style', maxCount: 5 },
    { name: 'script', maxCount: 5 },
    { name: 'route', maxCount: 1 },
    { name: 'view', maxCount: 5 }
]), async (req, res) => {
    const gameId = req.params.id;
    let { title, description } = req.body;
    const session_id = req.session.userId;

    // Получение данных об игре из базы данных
    connection.SelectGame(gameId, async (err, result) => {
        if (err) {
            console.log(err);
            return res.redirect(`/edit/${gameId}`);
        }

        // Функция для обработки файлов
        const processFiles = (fileType, maxCount, maxSize, pathPrefix) => {
            const files = req.files[fileType] || [];
            if (files.length > maxCount) {
                return { error: `Количество файлов ${fileType} не может превышать ${maxCount}` };
            }
            const filePaths = [];
            for (const file of files) {
                if (file.size > maxSize) {
                    return { error: `Файл ${file.originalname} весит более ${maxSize / (1024 * 1024)}МБ` };
                }
                filePaths.push(`${session_id}/${pathPrefix}/${file.originalname}`);
            }
            return { paths: filePaths.join(',') };
        };

        // Обработка всех типов файлов
        const viewFiles = processFiles('view', 5, 2098576, 'views');
        if (viewFiles.error) return res.render('layout', { body: 'addGame', global_error: viewFiles.error });

        const imageFiles = processFiles('image', 25, 10485760, 'images');
        if (imageFiles.error) return res.render('layout', { body: 'addGame', global_error: imageFiles.error });

        const scriptFiles = processFiles('script', 5, 20971520, 'scripts');
        if (scriptFiles.error) return res.render('layout', { body: 'addGame', global_error: scriptFiles.error });

        const cssFiles = processFiles('style', 5, 20971520, 'styles');
        if (cssFiles.error) return res.render('layout', { body: 'addGame', global_error: cssFiles.error });

        // Установка названий и описаний
        title = title || result[0].gameTitle;
        description = description || result[0].gameDescription;

        // Путь к загруженным файлам
        const routeFilePath = req.files['route'] ? `/${session_id}/routes/${req.files['route'][0].originalname}` : null;
        
        // Записываем информацию об игре в БД
        connection.UpdateGame(
            title,
            description,
            imageFiles.paths,
            cssFiles.paths,
            scriptFiles.paths,
            routeFilePath,
            viewFiles.paths,
            session_id,
            (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Ошибка при изменении игры');
                }
                res.redirect(`/edit/${gameId}`); // Перенаправляем на страницу с играми
            }
        );
    });
});

//Страница достижений
router.get('/achievements', (req, res) => {
    const userId = req.session.userId;

    if (!req.session.userId) return res.redirect('/login');

    connection.SelectAchievements(userId, (err, results) => {
        if (err) return console.log(err);

        const resAchievements = achievementsList.map(achievement => {
            const userAchievement = results.find(item => item.achievement_type === achievement.type);

            return {
                Name: achievement.Name,
                count: userAchievement ? userAchievement.count : 0,
                achieved: userAchievement ? userAchievement.count >= achievement.value : false,
                status: userAchievement ? (userAchievement.achieved ? 'Выполнено' : 'Не выполнено') : 'Не выполнено',
                img: achievement.img
            };
        });

        // Теперь просто вызываем функцию проверки достижений
        checkAchievements(userId);

        res.render('layout', { body: 'achievements', achievements: resAchievements });
    });
});

//Тест
// router.post('/updatewinrate',(req,res) => {
//     connection.UpdateWinRate(1,2,(err) => {
//         if(err) throw err
//         res.redirect('/achievements')
//     })
// })
//

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
        case 'achievements':
            res.redirect('/achievements')
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
            return res.render('layout', { error: 'Ошибка', body: 'acc_page'});
        }
        else{
            req.session.userThumbnail = avatar
            res.redirect('/acc_page')
        }
    })
});

function SelectAchievementsPromise(userId) {
    return new Promise((resolve, reject) => {
        connection.SelectAchievements(userId, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

function SelectOneAchievementPromise(userId) {
    return new Promise((resolve, reject) => {
        connection.SelectOneAchievement(userId, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

function InsertAchievementPromise(userId, achievement_type, newCount, achievement_name) {
    return new Promise((resolve, reject) => {
        connection.InsertAchievement(userId, achievement_type, newCount, achievement_name, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

async function checkAchievements(userId) {
    // Получаем текущие достижения пользователя
    const results = await SelectOneAchievementPromise(userId);
    const wins = results[0]?.wins || 0; // Получаем количество побед
    const losses = results[0]?.losses || 0; // Получаем количество поражений

    // Получаем существующие достижения пользователя
    const userAchievements = await SelectAchievementsPromise(userId);

    // Пробегаем по каждому достижению в achievementsList для побед
    for (const achievement of achievementsList) {
        if (achievement.type === 'wins' && wins >= achievement.value) {
            const achievementExists = userAchievements.some(item => 
                item.achievement_type === achievement.type && item.Name === achievement.Name
            );

            // Если его нет, вставляем новое достижение
            if (!achievementExists) {
                await InsertAchievementPromise(userId, achievement.type, wins, achievement.Name);
            }
        }
    }

    // Пробегаем по каждому достижению в achievementsList для поражений
    for (const achievement of achievementsList) {
        if (achievement.type === 'losses' && losses >= achievement.value) {
            const achievementExists = userAchievements.some(item => 
                item.achievement_type === achievement.type && item.Name === achievement.Name
            );

            // Если его нет, вставляем новое достижение
            if (!achievementExists) {
                await InsertAchievementPromise(userId, achievement.type, losses, achievement.Name);
            }
        }
    }
}

module.exports = router;