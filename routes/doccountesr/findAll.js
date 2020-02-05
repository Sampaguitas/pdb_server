const express = require('express');
const router = express.Router();
const DocCountEsr = require('../../models/DocCountEsr');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });
    DocCountEsr.find(data, function (err, doccountesr) {
        if (!doccountesr) {
            return res.status(400).json({
                message: 'No DocCountEsr match'
                //"1804": "No DocCountEsr match",
            });
        }
        else {
            return res.json(doccountesr);
        }
    });
});

module.exports = router;