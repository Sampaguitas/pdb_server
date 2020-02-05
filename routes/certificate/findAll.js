const express = require('express');
const router = express.Router();
const Certificate = require('../../models/Certificate');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    Certificate.find(data, function (err, certificate) {
        if (!certificate) {
            return res.status(400).json({
                message: 'No Certificate match'
                //"1904": "No Certificate match",
            });
        }
        else {
            return res.json(certificate);
        }
    });
});

module.exports = router;