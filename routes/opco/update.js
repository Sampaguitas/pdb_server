const express = require('express');
const router = express.Router();
const Opco = require('../../models/Opco');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = req.query.id
    Opco.findByIdAndUpdate(id, { $set: data }, function (err, opco) {
        if (!opco) {
            return res.status(400).json({
                message: fault(1001).message
                //"1001": "Opco does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1002).message
                //"1002": "Opco has been updated",
            });
        }
    });
});

module.exports = router;
