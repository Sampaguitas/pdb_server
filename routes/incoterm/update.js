const express = require('express');
const router = express.Router();
const Incoterm = require('../../models/Incoterm');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    const id = req.query.id
    Incoterm.findByIdAndUpdate(id, { $set: data }, function (err, incoterm) {
        if (!incoterm) {
            return res.status(400).json({
                message: fault(801).message
                //"801": "Incoterm does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(802).message
                //"802": "Incoterm has been updated",
            });
        }
    });
});

module.exports = router;
