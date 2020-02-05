const express = require('express');
const router = express.Router();
const DocCountPl = require('../../models/DocCountPl');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });
    const id = req.query.id
    DocCountPl.findByIdAndUpdate(id, { $set: data }, function (err, doccountpl) {
        if (!doccountpl) {
            return res.status(400).json({
                message: 'DocCountPl does not exist'
                //"1801": "DocCountPl does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'DocCountPl has been updated'
                //"1802": "DocCountPl has been updated",
            });
        }
    });
});

module.exports = router;
