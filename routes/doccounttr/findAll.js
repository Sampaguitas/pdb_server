const express = require('express');
const router = express.Router();
const DocCountTr = require('../../models/DocCountTr');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });
    DocCountTr.find(data, function (err, doccounttr) {
        if (!doccounttr) {
            return res.status(400).json({
                message: 'No DocCountTr match'
                //"1804": "No DocCountTr match",
            });
        }
        else {
            return res.json(doccounttr);
        }
    });
});

module.exports = router;