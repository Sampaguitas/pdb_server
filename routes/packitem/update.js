const express = require('express');
const router = express.Router();
const PackItem = require('../../models/PackItem');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = req.query.id
    PackItem.findByIdAndUpdate(id, { $set: data }, function (err, packitem) {
        if (!packitem) {
            return res.status(400).json({
                message: fault(1101).message
                //"1101": "PackItem does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1102).message
                //"1102": "PackItem has been updated",
            });
        }
    });
});

module.exports = router;
