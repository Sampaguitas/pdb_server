const express = require('express');
const router = express.Router();
const DocCountSm = require('../../models/DocCountSm');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountSm.findByIdAndDelete(id, function (err, doccountsm) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!doccountsm) {
            return res.status(400).json({ message: 'Could not find DocCountSm.' });
        }
        else {
            return res.status(200).json({ message: 'DocCountSm has successfully been deleted.' });
        }
    });
});

module.exports = router;