const express = require('express');
const router = express.Router();
const Sub = require('../../models/Sub');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    const id = req.query.id
    Sub.findByIdAndUpdate(id, { $set: data }, function (err, sub) {
        if (!sub) {
            return res.status(400).json({
                message: fault(1401).message
                //"1401": "Sub does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1402).message
                //"1402": "Sub has been updated",
            });
        }
    });
});

module.exports = router;
