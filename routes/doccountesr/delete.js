const express = require('express');
const router = express.Router();
const DocCountEsr = require('../../models/DocCountEsr');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountEsr.findByIdAndDelete(id, function (err, doccountesr) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        }
        if (!doccountesr) {
            return res.status(400).json({ message: 'Could not find DocCountEsr.' });
        }
        else {
            return res.status(200).json({ message: 'DocCountEsr has successfully been deleted.' });
        }
    });
});

module.exports = router;