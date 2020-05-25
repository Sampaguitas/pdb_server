const express = require('express');
const router = express.Router();
const DocCountSi = require('../../models/DocCountSi');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountSi.findByIdAndDelete(id, function (err, doccountsi) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!doccountsi) {
            return res.status(400).json({ message: 'Could not find DocCountSi.' });
        } else {
            return res.status(200).json({ message: 'DocCountSi has successfully been deleted.' });
        }
    });
});

module.exports = router;