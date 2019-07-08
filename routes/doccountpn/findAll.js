const express = require('express');
const router = express.Router();
const DocCountPn = require('../../models/DocCountPn');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });
    DocCountPn.find(data, function (err, doccountpn) {
        if (!doccountpn) {
            return res.status(400).json({
                message: fault(1804).message
                //"1804": "No DocCountPn match",
            });
        }
        else {
            return res.json(doccountpn);
        }
    });
});

module.exports = router;