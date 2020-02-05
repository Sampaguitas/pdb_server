const express = require('express');
const router = express.Router();
const DocCountPf = require('../../models/DocCountPf');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });
    const id = req.query.id
    DocCountPf.findByIdAndUpdate(id, { $set: data }, function (err, doccountpf) {
        if (!doccountpf) {
            return res.status(400).json({
                message: 'DocCountPf does not exist'
                //"1801": "DocCountPf does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'DocCountPf has been updated'
                //"1802": "DocCountPf has been updated",
            });
        }
    });
});

module.exports = router;
