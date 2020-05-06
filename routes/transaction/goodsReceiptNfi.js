const express = require('express');
const router = express.Router();
const Transaction = require('../../models/Transaction');

router.post('/', (req, res) => {
    res.status(400).json({message: 'Please be patient, still working on this route...'});
});

module.exports = router;