const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const connection = require('../database'); // Импортируйте соединение с вашей БД


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

module.exports = router;