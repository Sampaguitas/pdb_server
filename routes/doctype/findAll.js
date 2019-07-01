const express = require('express');
const router = express.Router();
const DocType = require('../../models/DocType');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    DocType.find(data, function (err, doctype) {
        if (!doctype) {
            return res.status(400).json({
                message: fault(2504).message
                //"2504": "No DocType match",
            });
        }
        else {
            return res.json(doctype);
        }
    });
});

module.exports = router;