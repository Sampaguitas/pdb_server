const express = require('express');
const router = express.Router();
const DocDefinition = require('../../models/DocDefinition');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    DocDefinition.find(data, function (err, docdefinition) {
        if (!docdefinition) {
            return res.status(400).json({
                message: fault(0404).message
                //"0404": "No DocDefinition match",
            });
        }
        else {
            return res.json(docdefinition);
        }
    });
});

module.exports = router;