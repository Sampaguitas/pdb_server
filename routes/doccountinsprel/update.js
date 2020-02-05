const express = require('express');
const router = express.Router();
const DocCountInsprel = require('../../models/DocCountInsprel');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });
    const id = req.query.id
    DocCountInsprel.findByIdAndUpdate(id, { $set: data }, function (err, doccountinsprel) {
        if (!doccountinsprel) {
            return res.status(400).json({
                message: 'DocCountInsprel does not exist'
                //"1801": "DocCountInsprel does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'DocCountInsprel has been updated'
                //"1802": "DocCountInsprel has been updated",
            });
        }
    });
});

module.exports = router;
