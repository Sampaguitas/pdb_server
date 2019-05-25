const express = require('express');
const router = express.Router();
const Region = require('../../models/Region');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    Region.find(data, function (err, region) {
        if (!region) {
            return res.status(400).json({
                message: fault(2304).message
                //"2304": "No Region match",
            });
        }
        else {
            return res.json(region);
        }
    });
});

module.exports = router;