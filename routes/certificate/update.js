const express = require('express');
const router = express.Router();
const Certificate = require('../../models/Certificate');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    const id = req.query.id
    Certificate.findByIdAndUpdate(id, { $set: data }, function (err, certificate) {
        if (!certificate) {
            return res.status(400).json({
                message: fault(1901).message
                //"1901": "Certificate does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1902).message
                //"1902": "Certificate has been updated",
            });
        }
    });
});

module.exports = router;
