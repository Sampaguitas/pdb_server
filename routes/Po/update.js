const express = require('express');
const router = express.Router();
const Po = require('../../models/Po');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    const id = req.query.id
    Po.findByIdAndUpdate(id, { $set: data }, function (err, po) {
        if (!po) {
            return res.status(400).json({
                message: fault(1201).message
                //"1201": "Po does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1202).message
                //"1202": "Po has been updated",
            });
        }
    });
});

module.exports = router;
