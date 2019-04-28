const express = require('express');
const router = express.Router();
const DocFlow = require('../../models/DocFlow');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    DocFlow.find(data, function (err, docflow) {
        if (!docflow) {
            return res.status(400).json({
                message: fault(0504).message
                //"0504": "No DocFlow match",
            });
        }
        else {
            return res.json(docflow);
        }
    });
});

module.exports = router;