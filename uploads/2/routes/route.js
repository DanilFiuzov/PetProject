var express = require('express');
var router = express.Router();
const connection = require('../database');

//Главный сайт
router.get('/', function(req, res, next) {
    res.render('Battal_Ship',{
        session: req.session
    });
});

//Режимы игры
router.get('/Solo_game', function(req, res) {
    res.render(`2/views/Solo_game.ejs`);
});
router.get('/Duo_game', function(req, res, next) {
    res.render(`2/views/Duo_game.ejs`);
});
router.get('/Net_game', function(req, res, next) {
    res.render(`2/views/Net_game.ejs`);
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
        res.redirect('/');
})


module.exports = router;