const express = require('express');
const router = express.Router();
const Certificate = require('../../models/Certificate');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    Certificate.findByIdAndRemove(id, function (err, certificate) {
        if (!certificate) {
            return res.status(400).json({
                message: fault(1901).message
                //"1901": "Certificate does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1903).message,
                //"1903": "Certificate has been deleted",
            });
        }
    });
});

module.exports = router;