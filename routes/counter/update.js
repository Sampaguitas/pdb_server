const express = require('express');
const router = express.Router();
const Counter = require('../../models/Counter');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });
    const id = req.query.id
    Counter.findByIdAndUpdate(id, { $set: data }, function (err, counter) {
        if (!counter) {
            return res.status(400).json({
                message: fault(1801).message
                //"1801": "Counter does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1802).message
                //"1802": "Counter has been updated",
            });
        }
    });
});

module.exports = router;
