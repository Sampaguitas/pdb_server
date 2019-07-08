const express = require('express');
const router = express.Router();
const DocCountPf = require('../../models/DocCountPf');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });
    DocCountPf.find(data, function (err, doccountpf) {
        if (!doccountpf) {
            return res.status(400).json({
                message: fault(1804).message
                //"1804": "No DocCountPf match",
            });
        }
        else {
            return res.json(doccountpf);
        }
    });
});

module.exports = router;