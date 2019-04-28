const express = require('express');
const router = express.Router();
const ColliType = require('../../models/ColliType');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    ColliType.find(data, function (err, collitype) {
        if (!collitype) {
            return res.status(400).json({
                message: fault(0304).message
                //"0304": "No ColliType match",
            });
        }
        else {
            return res.json(collitype);
        }
    });
});

module.exports = router;