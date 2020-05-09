const express = require('express');
const router = express.Router();
const Certificate = require('../../models/Certificate');

router.get('/', (req, res) => {

    Certificate.find({ projectId: req.query.projectId})
    .sort({
        cif: 'asc'
    })
    .populate({
        path: 'heats',
        options: {
            sort: {
                heatNr: 'asc'
            }
        }
    })
    .exec(function (err, certificates) {
        if (err) {
            return res.status(400).json({ message: 'Certificates could not be retreived.' })
        } else {
            return res.json(certificates);
        }
    });
});

module.exports = router;