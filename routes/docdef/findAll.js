const express = require('express');
const router = express.Router();
const DocDef = require('../../models/DocDef');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    DocDef.find(data, function (err, docdef) {
        if (!docdef) {
            return res.status(400).json({
                message: fault(0404).message
                //"0404": "No DocDef match",
            });
        }
        else {
            return res.json(docdef);
        }
    });
});

module.exports = router;