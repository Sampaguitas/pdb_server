const express = require('express');
const router = express.Router();
const Certificate = require('../../models/Certificate');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    Certificate.findByIdAndRemove(id, function (err, certificate) {
        if (!certificate) {
            return res.status(400).json({
                message: 'Certificate does not exist'
                //"1901": "Certificate does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'Certificate has been deleted'
                //"1903": "Certificate has been deleted",
            });
        }
    });
});

module.exports = router;