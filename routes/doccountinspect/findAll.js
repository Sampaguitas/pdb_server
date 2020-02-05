const express = require('express');
const router = express.Router();
const DocCountInspect = require('../../models/DocCountInspect');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });
    DocCountInspect.find(data, function (err, doccountinspect) {
        if (!doccountinspect) {
            return res.status(400).json({
                message: 'No DocCountInspect match'
                //"1804": "No DocCountInspect match",
            });
        }
        else {
            return res.json(doccountinspect);
        }
    });
});

module.exports = router;