const express = require('express');
const router = express.Router();
const PackItem = require('../../models/PackItem');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    PackItem.find(data, function (err, packitem) {
        if (!packitem) {
            return res.status(400).json({ 
                message: fault(1104).message
                //"1104": "No PackItem match",
            });
        }
        else {
            return res.json(packitem);
        }
    });
});

module.exports = router;