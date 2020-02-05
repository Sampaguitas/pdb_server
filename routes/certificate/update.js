const express = require('express');
const router = express.Router();
const Certificate = require('../../models/Certificate');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = req.query.id
    Certificate.findByIdAndUpdate(id, { $set: data }, function (err, certificate) {
        if (!certificate) {
            return res.status(400).json({
                message: 'Certificate does not exist'
                //"1901": "Certificate does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'Certificate has been updated'
                //"1902": "Certificate has been updated",
            });
        }
    });
});

module.exports = router;
