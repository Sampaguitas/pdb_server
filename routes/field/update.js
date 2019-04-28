const express = require('express');
const router = express.Router();
const Field = require('../../models/Field');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    const id = req.query.id
    Field.findByIdAndUpdate(id, { $set: data }, function (err, field) {
        if (!field) {
            return res.status(400).json({
                message: fault(0701).message
                //"0701": "Field does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(0702).message
                //"0702": "Field has been updated",
            });
        }
    });
});

module.exports = router;
