const express = require('express');
const router = express.Router();

router.get(`/test`,(req, res) => {
    console.log('awda')
    res.redirect('/')
})

module.exports = router;