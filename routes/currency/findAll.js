const express = require('express');
const router = express.Router();
const Currency = require('../../models/Currency');
const fault = require('../../utilities/Errors')
const keys = require('../../config/keys');


router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    Currency.find(data, function (err, currency) {
        if (!currency) {
            return res.status(400).json({
                res_no: 404,
                res_message: fault(404).message
                //"404": "No Currency match",
            });
        }
        else {
            return res.json(currency);
        }
    });
});


module.exports = router;