const express = require('express');
const router = express.Router();
const session = require('express-session');

router.get('/game/:id/test',(req, res) => {
    console.log('awda')
})

module.exports = router;