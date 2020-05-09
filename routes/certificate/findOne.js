const express = require('express');
const router = express.Router();
const Certificate = require('../../models/Certificate');

router.get('/', (req, res) => {
    Certificate.findById(req.query.id, function (err, certificate) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.'});
        } else if (!certificate) {
            return res.status(400).json({ message: 'Could not retreive the certificate.'});
        } else {
            return res.json(certificate);
        }
    });
});


module.exports = router;
