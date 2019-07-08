const express = require('express');
const router = express.Router();
const DocCountNfi = require('../../models/DocCountNfi');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });
    const id = req.query.id
    DocCountNfi.findByIdAndUpdate(id, { $set: data }, function (err, doccountnfi) {
        if (!doccountnfi) {
            return res.status(400).json({
                message: fault(1801).message
                //"1801": "DocCountNfi does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1802).message
                //"1802": "DocCountNfi has been updated",
            });
        }
    });
});

module.exports = router;
