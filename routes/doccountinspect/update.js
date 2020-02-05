const express = require('express');
const router = express.Router();
const DocCountInspect = require('../../models/DocCountInspect');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });
    const id = req.query.id
    DocCountInspect.findByIdAndUpdate(id, { $set: data }, function (err, doccountinspect) {
        if (!doccountinspect) {
            return res.status(400).json({
                message: 'DocCountInspect does not exist'
                //"1801": "DocCountInspect does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'DocCountInspect has been updated'
                //"1802": "DocCountInspect has been updated",
            });
        }
    });
});

module.exports = router;
