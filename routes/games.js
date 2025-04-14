const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const connection = require('../database'); // Импортируйте соединение с вашей БД

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

// Форма создания новой игры
router.get('/add', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Если пользователь не авторизован, перенаправляем на страницу логина
    }
    res.render('addGame'); // Ваша EJS форма для добавления игры
});

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

// Редактирование игры
router.get('/edit/:id', (req, res) => {
    const gameId = req.params.id;
    connection.query('SELECT * FROM games WHERE gameID = ? AND customerID = ?', [gameId, req.session.userId], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).send('Игра не найдена');
        }
        res.render('editGame', { game: results[0] }); // Ваша форма редактирования игры
    });
});

// Обработка редактирования игры
router.post('/edit/:id', upload.single('image'), (req, res) => {
    const gameId = req.params.id;
    const { title, description } = req.body;
    const imagePath = req.file ? `uploads/${req.session.userId}/${req.file.originalname}` : null;

    connection.query('UPDATE games SET gameTitle = ?, gameDescription = ?, gameImage = ? WHERE gameID = ? AND customerID = ?', 
    [title, description, imagePath ? imagePath : connection.query('SELECT image FROM games WHERE gameID = ?', [gameId]), gameId, req.session.userId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при обновлении игры');
        }
        res.redirect('/games');
    });
});

// Удаление игры
router.post('/delete/:id', (req, res) => {
    const gameId = req.params.id;

    connection.query('DELETE FROM games WHERE gameID = ? AND customerID = ?', [gameId, req.session.userId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Ошибка при удалении игры');
        }
        res.redirect('/games');
    });
});

module.exports = router;