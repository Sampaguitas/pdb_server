const express = require('express');
const router = express.Router();
const DocDefinition = require('../../models/DocDefinition');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    const id = req.query.id
    DocDefinition.findByIdAndUpdate(id, { $set: data }, function (err, docdefinition) {
        if (!docdefinition) {
            return res.status(400).json({
                message: fault(0401).message
                //"0401": "DocDefinition does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(0402).message
                //"0402": "DocDefinition has been updated",
            });
        }
    });
});

module.exports = router;
