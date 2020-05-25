const express = require('express');
const router = express.Router();
const DocCountPl = require('../../models/DocCountPl');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountPl.findByIdAndDelete(id, function (err, doccountpl) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!doccountpl) {
            return res.status(400).json({ message: 'Could not find DocCountPl.' });
        } else {
            return res.status(200).json({ message: 'DocCountPl has successfully been deleted.' });
        }
    });
});

module.exports = router;