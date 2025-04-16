const express = require('express');
const router = express.Router();

router.get(`/game/:id/test`,(req, res) => {
    console.log('awda')
})

module.exports = router;