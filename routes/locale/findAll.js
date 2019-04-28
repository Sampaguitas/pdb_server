const express = require('express');
const router = express.Router();
const Locale = require('../../models/Locale');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    Locale.find(data, function (err, locale) {
        if (!locale) {
            return res.status(400).json({
                message: fault(0904).message
                //"0904": "No Locale match",
            });
        }
        else {
            return res.json(locale);
        }
    });
});

module.exports = router;