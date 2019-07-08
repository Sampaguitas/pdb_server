const express = require('express');
const router = express.Router();
const DocCountInsprel = require('../../models/DocCountInsprel');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });
    DocCountInsprel.find(data, function (err, doccountinsprel) {
        if (!doccountinsprel) {
            return res.status(400).json({
                message: fault(1804).message
                //"1804": "No DocCountInsprel match",
            });
        }
        else {
            return res.json(doccountinsprel);
        }
    });
});

module.exports = router;