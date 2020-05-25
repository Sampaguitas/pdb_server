const express = require('express');
const router = express.Router();
const Opco = require('../../models/Opco');

router.delete('/', (req, res) => {
    const id = req.query.id
    Opco.findByIdAndDelete(id, function (err, opco) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' })
        } else if (!opco) {
            return res.status(400).json({ message: 'Could not find Opco.' });
        } else {
            return res.status(200).json({ message: 'Opco has successfully been deleted.' });
        }
    });
});

module.exports = router;