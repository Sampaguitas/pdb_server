const express = require('express');
const router = express.Router();
const ColliPack = require('../../models/ColliPack');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    const id = req.query.id
    ColliPack.findByIdAndUpdate(id, { $set: data }, function (err, collipack) {
        if (!collipack) {
            return res.status(400).json({
                message: fault(0201).message
                //"0201": "ColliPack does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(0202).message
                //"0202": "ColliPack has been updated",,
            });
        }
    });
});

module.exports = router;
