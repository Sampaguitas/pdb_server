const express = require('express');
const router = express.Router();
const DocField = require('../../models/DocField');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    const id = req.query.id
    DocField.findByIdAndUpdate(id, { $set: data }, function (err, docfield) {
        if (!docfield) {
            return res.status(400).json({
                message: fault(2601).message
                //"2601": "DocField does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(2602).message
                //"2602": "DocField has been updated",
            });
        }
    });
});

module.exports = router;
