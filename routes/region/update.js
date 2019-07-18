const express = require('express');
const router = express.Router();
const Region = require('../../models/Region');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = req.query.id
    Region.findByIdAndUpdate(id, { $set: data }, function (err, region) {
        if (!region) {
            return res.status(400).json({
                message: fault(2301).message
                //"2301": "Region does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(2302).message
                //"2302": "Region has been updated",
            });
        }
    });
});

module.exports = router;
