const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    res.status(400).json({message: "this functionality has temporarily been disabled."});
});

module.exports = router;