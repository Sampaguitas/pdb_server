const express = require('express');
const router = express.Router();
const DocCountPl = require('../../models/DocCountPl');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });
    DocCountPl.find(data, function (err, doccountpl) {
        if (!doccountpl) {
            return res.status(400).json({
                message: fault(1804).message
                //"1804": "No DocCountPl match",
            });
        }
        else {
            return res.json(doccountpl);
        }
    });
});

module.exports = router;