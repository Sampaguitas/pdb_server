const express = require('express');
const router = express.Router();
const ColliType = require('../../models/ColliType');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    const id = req.query.id
    ColliType.findByIdAndUpdate(id, { $set: data }, function (err, collitype) {
        if (!collitype) {
            return res.status(400).json({
                message: fault(0301).message
                //"0301": "ColliType does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(0302).message
                //"0302": "ColliType has been updated",
            });
        }
    });
});

module.exports = router;
