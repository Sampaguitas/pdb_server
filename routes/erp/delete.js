const express = require('express');
const router = express.Router();
const Erp = require('../../models/Erp');

router.delete('/', (req, res) => {
    const id = req.query.id
    Erp.findByIdAndDelete(id, function (err, erp) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!erp) {
            return res.status(400).json({ message: 'Could not find Erp.' });
        } else {
            return res.status(200).json({ message: 'Erp has successfully been deleted.' });
        }
    });
});

module.exports = router;