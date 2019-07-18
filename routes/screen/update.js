const express = require('express');
const router = express.Router();
const Screen = require('../../models/Screen');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = req.query.id
    Screen.findByIdAndUpdate(id, { $set: data }, function (err, screen) {
        if (!screen) {
            return res.status(400).json({
                message: fault(2001).message
                //"2001": "Screen does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(2002).message
                //"2002": "Screen has been updated",
            });
        }
    });
});

module.exports = router;
