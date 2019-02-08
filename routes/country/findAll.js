const express = require('express');
const router = express.Router();
const Country = require('../../models/Country');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    Country.find(data, function (err, country) {
        if (!country) {
            return res.status(400).json({
                message: fault(604).message
                //"604": "No Country match",
            });
        }
        else {
            return res.json(country);
        }
    });
});


module.exports = router;