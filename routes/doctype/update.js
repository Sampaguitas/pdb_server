const express = require('express');
const router = express.Router();
const DocType = require('../../models/DocType');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = req.query.id
    DocType.findByIdAndUpdate(id, { $set: data }, function (err, doctype) {
        if (!doctype) {
            return res.status(400).json({
                message: fault(0401).message
                //"0401": "DocType does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(0402).message
                //"0402": "DocType has been updated",
            });
        }
    });
});

module.exports = router;
