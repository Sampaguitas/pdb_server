const express = require('express');
const router = express.Router();
const DocFlow = require('../../models/DocFlow');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = req.query.id
    DocFlow.findByIdAndUpdate(id, { $set: data }, function (err, docflow) {
        if (!docflow) {
            return res.status(400).json({
                message: fault(0501).message
                //"0501": "DocFlow does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(0502).message
                //"0502": "DocFlow has been updated",
            });
        }
    });
});

module.exports = router;
