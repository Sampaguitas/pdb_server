const express = require('express');
const router = express.Router();
const ColliPack = require('../../models/ColliPack');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    ColliPack.find(data, function (err, collipack) {
        if (!collipack) {
            return res.status(400).json({
                message: fault(0204).message
                //"0204": "No ColliPack match",
            });
        }
        else {
            return res.json(collipack);
        }
    });
});

module.exports = router;