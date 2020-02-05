const express = require('express');
const router = express.Router();
const DocCountNfi = require('../../models/DocCountNfi');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });
    const id = req.query.id
    DocCountNfi.findByIdAndUpdate(id, { $set: data }, function (err, doccountnfi) {
        if (!doccountnfi) {
            return res.status(400).json({
                message: 'DocCountNfi does not exist'
                //"1801": "DocCountNfi does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'DocCountNfi has been updated'
                //"1802": "DocCountNfi has been updated",
            });
        }
    });
});

module.exports = router;
