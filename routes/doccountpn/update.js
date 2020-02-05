const express = require('express');
const router = express.Router();
const DocCountPn = require('../../models/DocCountPn');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });
    const id = req.query.id
    DocCountPn.findByIdAndUpdate(id, { $set: data }, function (err, doccountpn) {
        if (!doccountpn) {
            return res.status(400).json({
                message: 'DocCountPn does not exist'
                //"1801": "DocCountPn does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'DocCountPn has been updated'
                //"1802": "DocCountPn has been updated",
            });
        }
    });
});

module.exports = router;
