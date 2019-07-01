const express = require('express');
const router = express.Router();
const DocField = require('../../models/DocField');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    DocField.find(data, function (err, docfield) {
        if (!docfield) {
            return res.status(400).json({
                message: fault(2604).message
                //"2604": "No DocField match",
            });
        }
        else {
            return res.json(docfield);
        }
    });
});

module.exports = router;