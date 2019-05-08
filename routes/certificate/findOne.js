const express = require('express');
const router = express.Router();
const Certificate = require('../../models/Certificate');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    Certificate.findById(id, function (err, certificate) {
        if (!certificate) {
            return res.status(404).json({
                message: fault(1901).message
                //"1901": "Certificate does not exist",
            });
        }
        else {
            return res.json(certificate);
        }
    });
});


module.exports = router;
