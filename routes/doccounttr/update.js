const express = require('express');
const router = express.Router();
const DocCountTr = require('../../models/DocCountTr');

router.put('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });
    const id = req.query.id
    DocCountTr.findByIdAndUpdate(id, { $set: data }, function (err, doccounttr) {
        if (!doccounttr) {
            return res.status(400).json({
                message: 'DocCountTr does not exist'
                //"1801": "DocCountTr does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'DocCountTr has been updated'
                //"1802": "DocCountTr has been updated",
            });
        }
    });
});

module.exports = router;
