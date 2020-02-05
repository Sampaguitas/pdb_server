const express = require('express');
const router = express.Router();
const DocCountSm = require('../../models/DocCountSm');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });
    DocCountSm.find(data, function (err, doccountsm) {
        if (!doccountsm) {
            return res.status(400).json({
                message: 'No DocCountSm match'
                //"1804": "No DocCountSm match",
            });
        }
        else {
            return res.json(doccountsm);
        }
    });
});

module.exports = router;