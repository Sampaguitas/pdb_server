const express = require('express');
const router = express.Router();
const DocCountSi = require('../../models/DocCountSi');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });
    DocCountSi.find(data, function (err, doccountsi) {
        if (!doccountsi) {
            return res.status(400).json({
                message: fault(1804).message
                //"1804": "No DocCountSi match",
            });
        }
        else {
            return res.json(doccountsi);
        }
    });
});

module.exports = router;