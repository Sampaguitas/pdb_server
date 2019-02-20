const express = require('express');
const router = express.Router();
const Incoterm = require('../../models/Incoterm');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    Incoterm.find(data, function (err, incoterm) {
        if (!incoterm) {
            return res.status(400).json({
                message: fault(804).message
                //"804": "No Incoterm match",
            });
        }
        else {
            return res.json(incoterm);
        }
    });
});

module.exports = router;