const express = require('express');
const router = express.Router();
const Currency = require('../../models/Currency');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    const id = req.query.id
    Currency.findByIdAndUpdate(id, { $set: data }, function (err, currency) {
        if (!currency) {
            return res.status(400).json({
                message: fault(2201).message
                //"2201": "Curreny does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(2202).message
                //"2202": "Curreny has been updated",
            });
        }
    });
});

module.exports = router;
