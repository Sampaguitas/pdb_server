const express = require('express');
const router = express.Router();
const DocCountPt = require('../../models/DocCountPt');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });
    DocCountPt.find(data, function (err, doccountpt) {
        if (!doccountpt) {
            return res.status(400).json({ message: 'No DocCountPt match' });
        }
        else {
            return res.json(doccountpt);
        }
    });
});

module.exports = router;