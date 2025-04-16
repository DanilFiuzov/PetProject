const express = require('express');
const router = express.Router();

router.get('/',(req, res) => {
    res.render('layout',{body: '2/views/index.ejs'})
})

module.exports = router;