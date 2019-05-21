const express = require('express');
const router = express.Router();
const Currency = require('../../models/Currency');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    Currency.find(data, function (err, currency) {
        if (!currency) {
            return res.status(400).json({
                message: fault(2204).message
                //"2204": "No Curreny match",
            });
        }
        else {
            return res.json(currency);
        }
    });
});

module.exports = router;