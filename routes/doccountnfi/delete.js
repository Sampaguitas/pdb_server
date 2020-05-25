const express = require('express');
const router = express.Router();
const DocCountNfi = require('../../models/DocCountNfi');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountNfi.findByIdAndDelete(id, function (err, doccountnfi) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!doccountnfi) {
            return res.status(400).json({ message: 'Could not find DocCountNfi.' });
        } else {
            return res.status(200).json({ message: 'DocCountNfi has successfully been deleted.' });
        }
    });
});

module.exports = router;