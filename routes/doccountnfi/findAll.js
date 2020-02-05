const express = require('express');
const router = express.Router();
const DocCountNfi = require('../../models/DocCountNfi');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });
    DocCountNfi.find(data, function (err, doccountnfi) {
        if (!doccountnfi) {
            return res.status(400).json({
                message: 'No DocCountNfi match'
                //"1804": "No DocCountNfi match",
            });
        }
        else {
            return res.json(doccountnfi);
        }
    });
});

module.exports = router;