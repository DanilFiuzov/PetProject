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

//Главная страница
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

                // Отправляем данные на рендеринг
                res.render('layout', { body: 'products', products: products, session: req.session });
            });
        } else {
            // Если пользователь не вошел, просто передаем все продукты
            res.render('layout', { body: 'products', products: products, session: req.session });
        }
    });
});
// Форма создания новой игры
// router.get('/add', (req, res) => {
//     if (!req.session.userId || req.session.userRank !== 'Разработчик') {
//         return res.redirect('/login'); // Если пользователь не авторизован, перенаправляем на страницу логина
//     }
//     res.render('layout',{body:'addGame'}); 
// });

// Обработка формы добавления игры
// router.post('/add', upload.fields([
//     { name: 'image', maxCount: 25 }, // maxCount: 25 для картинок
//     { name: 'style', maxCount: 5 }, // maxCount: 5 для стилей
//     { name: 'script', maxCount: 5 }, // maxCount: 5 для скриптов
//     { name: 'route', maxCount: 1 }, // maxCount: 1 для роутинга
//     { name: 'view', maxCount: 5 } // maxCount: 5 для представлений
// ]), (req, res) => {
//     const { title, description } = req.body;
//     const session_id = req.session.userId
//     let [
//         view_files_array,
//         image_files_array,
//         script_files_array,
//         css_files_array
//     ] = [[], [], [], []];

//     // Проверка наличия файлов представлений
//     let view_files = req.files['view'];
//     if (view_files && view_files.length > 5) {
//         return res.render('layout', { body: 'addGame', global_error: 'Количество файлов ejs представлений не может превышать 5' });
//     }
//     if (view_files) {
//         for (const element of view_files) {
//             if (element.size > 2098576) {
//                 return res.render('layout', { body: 'addGame', global_error: `Файл ${element.originalname} весит более 2МБ` });
//             }
//             view_files_array.push(`${req.session.userId}/views/${element.originalname}`);
//         }
//     }

//     // Проверка наличия картинок
//     let image_files = req.files['image'];
//     if (image_files && image_files.length > 25) {
//         return res.render('layout', { body: 'addGame', global_error: 'Количество картинок не может превышать 25' });
//     }
//     if (image_files) {
//         for (const element of image_files) {
//             if (element.size > 10485760) {
//                 return res.render('layout', { body: 'addGame', global_error: `Файл ${element.originalname} весит более 10МБ` });
//             }
//             image_files_array.push(`${req.session.userId}/images/${element.originalname}`);
//         }
//     }

//     // Проверка наличия скриптов
//     let script_files = req.files['script'];
//     if (script_files && script_files.length > 5) {
//         return res.render('layout', { body: 'addGame', global_error: 'Количество файлов скриптов не может превышать 5' });
//     }
//     if (script_files) {
//         for (const element of script_files) {
//             if (element.size > 20971520) {
//                 return res.render('layout', { body: 'addGame', global_error: `Файл ${element.originalname} весит более 2МБ` });
//             }
//             script_files_array.push(`${req.session.userId}/scripts/${element.originalname}`);
//         }
//     }

//     let css_files = req.files['style'];
//     if (css_files && css_files.length > 5) {
//         return res.render('layout', { body: 'addGame', global_error: 'Количество файлов стилей не может превышать 5' });
//     }
//     if (css_files) {
//         for (const element of css_files) {
//             if (element.size > 20971520) {
//                 return res.render('layout', { body: 'addGame', global_error: `Файл ${element.originalname} весит более 2МБ` });
//             }
//             css_files_array.push(`${req.session.userId}/styles/${element.originalname}`);
//         }
//     }

//     // Путь к загруженным файлам
//     const imagePath = image_files_array.join(',');
//     const cssFilePath = css_files_array.join(',');
//     const jsFilePath = script_files_array.join(',');
//     const routeFilePath = req.files['route'] ? `/${req.session.userId}/routes/${req.files['route'][0].originalname}` : null;
//     const viewFilePath = view_files_array.join(',');

//     // Проверка, что файлы загружены
//     if (!req.files) {
//         return res.render('layout', { body: 'addGame', global_error: `Убедитесь что все файлы загружены. Даже если у вас например нет файлв стилей вам небходимо добавить пустой файл` });
//     }

//     // Записываем информацию об игре в БД
//     connection.AddGame(session_id, title, description, imagePath, cssFilePath, jsFilePath, routeFilePath, viewFilePath, (err) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).send('Ошибка при добавлении игры');
//         }
//         req.session.userCountGames = 1
//         res.redirect('/'); // Перенаправляем на страницу с играми
//     });
// });

// Удаление игры
// router.post('/delete/:id', (req, res) => {
//     const gameId = req.params.id;
//     const session_id = req.session.userId

//     const deleteFolder = (folderPath) => {
//         fs.rmdir(folderPath, { recursive: true }, (err) => {
//             if (err) {
//                 console.error('Ошибка при удалении папки:', err);
//             } else {
//                 console.log('Папка удалена:', folderPath);
//             }
//         });
//     };

//     connection.DeleteGame(gameId, session_id, (err) => {
//         if (err) {
//             console.error(err);
//             return res.status(500).send('Ошибка при удалении игры');
//         }
//         else{
//             const folderPath = path.join('./uploads', `${session_id}`);
//             deleteFolder(folderPath); 
//             if(req.session.CountGames){
//                 req.session.CountGames = req.session.CountGames-1
//             }
//             res.redirect('/acc_page')
//         }
//     });
// });

//Игра
// router.get('/game/:id', (req, res) => {
//     const gameId = req.params.id;
//     if(!req.session.userId){
//         res.redirect('/login')
//     }
//     else{
//         const session_id = req.session.userId
//         connection.SelectWinLoss(session_id, gameId,(err,winloss_result) => {
//             if(err){
//                 console.log(err)
//                 return res.render('layout',{global_error: 'Ошибка при получении данных игры', body: 'games'});
//             }
//             else if (winloss_result.length<1){
//                 connection.AddEmpty(session_id,gameId,(err) => {
//                     if (err) {
//                         console.log(err)
//                         return res.render('layout',{global_error: 'Ошибка при получении данных игры', body: 'games'});
//                     }
//                     else{
//                         connection.SelectGame(gameId,(err,result) => {
//                             if (err) {
//                                 console.log(err)
//                                 return res.render('layout',{global_error: 'Ошибка при получении данных игры', body: 'games'});
//                             }
//                             else{
//                                 connection.SelectWinLoss(session_id,gameId,(err,winloss_result) => {
//                                     if(err){

//                                     }
//                                     else{
//                                         req.session.activeGameID = result[0].gameID
//                                         req.session.SelectGameWins = winloss_result[0].wins
//                                         req.session.SelectGameLosses = winloss_result[0].losses
//                                         req.session.SelectGameDraws = winloss_result[0].draws
//                                         req.session.SelectGameScore = winloss_result[0].score
//                                         res.render(`${result[0].customerID}/views/index.ejs`, { result: result });
//                                     }
//                                 })
//                             }
//                         })
//                     }
//                 })
//             }
//             else{
//                 connection.SelectGame(gameId,(err,result) => {
//                     if (err || result.length === 0) {
//                         console.log(err)
//                         return res.render('layout',{global_error: 'Ошибка при получении данных игры', body: 'games'});
//                     }
//                     req.session.activeGameID = result[0].gameID
//                     req.session.SelectGameWins = winloss_result[0].wins
//                     req.session.SelectGameLosses = winloss_result[0].losses
//                     res.render(`${result[0].customerID}/views/index.ejs`, { result: result });
//                 })
//             }
//         })
//     }
// })

//Страница изменения игры
// router.get('/edit/:id', (req, res) =>{
//     const gameId = req.params.id;
//     if (!req.session.userId || req.session.userRank !== 'Разработчик') {
//         return res.redirect('/login'); // Если пользователь не авторизован, перенаправляем на страницу логина
//     }
//     else{
//         connection.SelectGame(gameId,(err,result) => {
//             if(err){
//                 console.log(err)
//                 return res.render('layout', {body: 'mygames', global_error: "Ошибка при получении данных игры"})
//             }
//             else{
//                 res.render('layout',{body:'editGame',games: result});
//             }
//         })
//     }
// });

// Функция для удаления файлов из папки
// const removeFilesFromDirectory = (files) => {
//     const uploadDir = path.join('./uploads');
    
//     // Возвращаем промис для удаления файлов
//     return Promise.all(files.map(file => {
//         return new Promise((resolve, reject) => {
//             const filePath = path.join(uploadDir, file);

//             // Проверяем, является ли файл действительно файлом
//             fs.stat(filePath, (err, stats) => {
//                 if (err) {
//                     console.error(`Ошибка при проверке файла ${file}: ${err.message}`);
//                     return reject(err);
//                 }

//                 if (stats.isFile()) {
//                     fs.unlink(filePath, (err) => {
//                         if (err) {
//                             console.error(`Ошибка при удалении файла ${file}: ${err.message}`);
//                             return reject(err);
//                         } else {
//                             console.log(`Файл ${file} успешно удалён.`);
//                             resolve();
//                         }
//                     });
//                 } else {
//                     console.error(`${filePath} не является файлом.`);
//                     resolve(); // Если это не файл, просто разрешаем промис
//                 }
//             });
//         });
//     }));
// };

//Удаление данных игры
// router.post('/delete_data/:id',(req,res) => {
//     let datafordelete = req.params.id.split("_")
//     let data = datafordelete[0], gameId = datafordelete[1]
    
//     connection.SelectGame(gameId,(err,result) => {
//         if(err){
//             console.log(err)
//         }else{
//             connection.DeleteGameData(data,gameId,(err) => {
//                 if(err){
//                     console.log(err)
//                 }
//                 else{
//                     if(result[0][data] !== null){
//                     delete_data = result[0][data].split(",")
//                     removeFilesFromDirectory(delete_data) 
//                     }else{
//                         console.log(err)
//                     }
//                 }
//             })         
//         }
//     })
// })

//Форма изменения данных игры
// router.post('/edit/:id', upload.fields([
//     { name: 'image', maxCount: 25 },
//     { name: 'style', maxCount: 5 },
//     { name: 'script', maxCount: 5 },
//     { name: 'route', maxCount: 1 },
//     { name: 'view', maxCount: 5 }
// ]), async (req, res) => {
//     const gameId = req.params.id;
//     let { title, description } = req.body;
//     const session_id = req.session.userId;

//     // Получение данных об игре из базы данных
//     connection.SelectGame(gameId, async (err, result) => {
//         if (err) {
//             console.log(err);
//             return res.redirect(`/edit/${gameId}`);
//         }

//         // Функция для обработки файлов
//         const processFiles = (fileType, maxCount, maxSize, pathPrefix) => {
//             const files = req.files[fileType] || [];
//             if (files.length > maxCount) {
//                 return { error: `Количество файлов ${fileType} не может превышать ${maxCount}` };
//             }
//             const filePaths = [];
//             for (const file of files) {
//                 if (file.size > maxSize) {
//                     return { error: `Файл ${file.originalname} весит более ${maxSize / (1024 * 1024)}МБ` };
//                 }
//                 filePaths.push(`${session_id}/${pathPrefix}/${file.originalname}`);
//             }
//             return { paths: filePaths.join(',') };
//         };

//         // Обработка всех типов файлов
//         const viewFiles = processFiles('view', 5, 2098576, 'views');
//         if (viewFiles.error) return res.render('layout', { body: 'addGame', global_error: viewFiles.error });

//         const imageFiles = processFiles('image', 25, 10485760, 'images');
//         if (imageFiles.error) return res.render('layout', { body: 'addGame', global_error: imageFiles.error });

//         const scriptFiles = processFiles('script', 5, 20971520, 'scripts');
//         if (scriptFiles.error) return res.render('layout', { body: 'addGame', global_error: scriptFiles.error });

//         const cssFiles = processFiles('style', 5, 20971520, 'styles');
//         if (cssFiles.error) return res.render('layout', { body: 'addGame', global_error: cssFiles.error });

//         // Установка названий и описаний
//         title = title || result[0].gameTitle;
//         description = description || result[0].gameDescription;

//         // Путь к загруженным файлам
//         const routeFilePath = req.files['route'] ? `/${session_id}/routes/${req.files['route'][0].originalname}` : null;
        
//         // Записываем информацию об игре в БД
//         connection.UpdateGame(
//             title,
//             description,
//             imageFiles.paths,
//             cssFiles.paths,
//             scriptFiles.paths,
//             routeFilePath,
//             viewFiles.paths,
//             session_id,
//             (err) => {
//                 if (err) {
//                     console.error(err);
//                     return res.status(500).send('Ошибка при изменении игры');
//                 }
//                 res.redirect(`/edit/${gameId}`); // Перенаправляем на страницу с играми
//             }
//         );
//     });
// });

//Страница достижений
// router.get('/achievements', (req, res) => {
//     const userId = req.session.userId;

//     if (!req.session.userId) return res.redirect('/login');

//     connection.SelectAchievements(userId, (err, results) => {
//         if (err) return console.log(err);

//         const resAchievements = achievementsList.map(achievement => {
//             const userAchievement = results.find(item => item.achievement_type === achievement.type);

//             return {
//                 Name: achievement.Name,
//                 count: userAchievement ? userAchievement.count : 0,
//                 achieved: userAchievement ? userAchievement.count >= achievement.value : false,
//                 status: userAchievement ? (userAchievement.achieved ? 'Выполнено' : 'Не выполнено') : 'Не выполнено',
//                 img: achievement.img
//             };
//         });

//         // Теперь просто вызываем функцию проверки достижений
//         checkAchievements(userId);

//         res.render('layout', { body: 'achievements', achievements: resAchievements });
//     });
// });

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
        return res.render('layout', { error: 'Fill in all the fields!', body: 'register' });
    };
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if(!emailRegex.test(email)){
        return res.render('layout', { error: 'Wrong email!', body: 'register' });
    };
    if(password.length < 0){
        return res.render('layout', { error: 'The password cannot be less than 8 characters!', body: 'register' });
    };
    if(username.length > 16){
        return res.render('layout', { error: 'The nickname cannot be less than 16 characters!', body: 'register' });
    };
    if(password !== confirmpassword){
        return res.render('layout', { error: "Passwords don't match!", body: 'register' });
    };
    connection.findUserByUsername(email, (err, results) => {
        if(Object.keys(results).length > 0){
            console.error(err);
            return res.render('layout', { error: 'Such a user already exists!', body: 'register'});
        }
        else{
            connection.createUser(username, hashedPassword, email, (err, results) => {
            if (err) {
                console.error(err);
                return res.render('layout', { error: 'Error during registration!', body: 'register' });
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
        return res.render('layout', { error: 'Fill in all the fields!', body: 'login' });
    }

    connection.findUserByUsername(email, (err, results) => {
        if (err) {
            console.error(err);
            return res.render('layout', { error: 'Error when logging in.', body: 'login' });
        }

        if (results.length > 0) {
            const user = results[0];
            const isMatch = bcrypt.compareSync(password, user.customerPassword);
            if (isMatch) {
                req.session.userId = user.customerID;
                req.session.userThumbnail = user.customerThumbnail;
                req.session.userEmail = user.customerEmail;
                req.session.userName = user.customerName;

                // Получение избранных товаров после входа
                connection.getFavoritesByCustomerID(user.customerID, (err, favorites) => {
                    if (err) {
                        console.error(err);
                    } else {
                        req.session.favorites = favorites.map(item => item.productID); // Сохраним в сессии
                    }
                    res.redirect('/');
                });
            } else {
                return res.render('layout', { error: 'Wrong password', body: 'login' });
            }
        } else {
            return res.render('layout', { error: 'In correct user', body: 'login' });
        }
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


// function SelectAchievementsPromise(userId) {
//     return new Promise((resolve, reject) => {
//         connection.SelectAchievements(userId, (err, results) => {
//             if (err) return reject(err);
//             resolve(results);
//         });
//     });
// }

// function SelectOneAchievementPromise(userId) {
//     return new Promise((resolve, reject) => {
//         connection.SelectOneAchievement(userId, (err, results) => {
//             if (err) return reject(err);
//             resolve(results);
//         });
//     });
// }

// function InsertAchievementPromise(userId, achievement_type, newCount, achievement_name) {
//     return new Promise((resolve, reject) => {
//         connection.InsertAchievement(userId, achievement_type, newCount, achievement_name, (err) => {
//             if (err) return reject(err);
//             resolve();
//         });
//     });
// }

// async function checkAchievements(userId) {
//     // Получаем текущие достижения пользователя
//     const results = await SelectOneAchievementPromise(userId);
//     const wins = results[0]?.wins || 0; // Получаем количество побед
//     const losses = results[0]?.losses || 0; // Получаем количество поражений

//     // Получаем существующие достижения пользователя
//     const userAchievements = await SelectAchievementsPromise(userId);

//     // Пробегаем по каждому достижению в achievementsList для побед
//     for (const achievement of achievementsList) {
//         if (achievement.type === 'wins' && wins >= achievement.value) {
//             const achievementExists = userAchievements.some(item => 
//                 item.achievement_type === achievement.type && item.Name === achievement.Name
//             );

//             // Если его нет, вставляем новое достижение
//             if (!achievementExists) {
//                 await InsertAchievementPromise(userId, achievement.type, wins, achievement.Name);
//             }
//         }
//     }

//     // Пробегаем по каждому достижению в achievementsList для поражений
//     for (const achievement of achievementsList) {
//         if (achievement.type === 'losses' && losses >= achievement.value) {
//             const achievementExists = userAchievements.some(item => 
//                 item.achievement_type === achievement.type && item.Name === achievement.Name
//             );

//             // Если его нет, вставляем новое достижение
//             if (!achievementExists) {
//                 await InsertAchievementPromise(userId, achievement.type, losses, achievement.Name);
//             }
//         }
//     }
// }


module.exports = router;