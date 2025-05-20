var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt') 
const connection_db =require('../data_base')

//Главный сайт
router.get('/', function(req, res, next) {
    res.render('Battal_Ship',{
        session: req.session
    });
});

//Режимы игры
router.get('/Solo_game', function(req, res, next) {
    res.render('Solo_game');
});
router.get('/Duo_game', function(req, res, next) {
    res.render('Duo_game');
});
router.get('/Net_game', function(req, res, next) {
    res.render('Net_game');
});


//Взять данные с сессии и передать клиенту
router.get('/take_data', (req,res)=>{
    if (!req.session.USER) {
        return res.status(401).json({ error: "Не авторизован" });
    }
    res.json({
        Data_session:req.session.USER
    })
})
//Выйти с аккаунта(post)
router.post('/go_out',(req,res)=>{
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/'); // Ошибка при выходе
        }
        res.redirect('/'); // Успешный выход
    });
})


module.exports = router;