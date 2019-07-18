const express = require('express');
const router = express.Router();
const Locale = require('../../models/Locale');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = req.query.id
    Locale.findByIdAndUpdate(id, { $set: data }, function (err, locale) {
        if (!locale) {
            return res.status(400).json({
                message: fault(0901).message
                //"0901": "Locale does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(0902).message
                //"0902": "Locale has been updated",
            });
        }
    });
});

module.exports = router;
