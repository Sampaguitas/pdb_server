const express = require('express');
const router = express.Router();
const DocCountTr = require('../../models/DocCountTr');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountTr.findByIdAndDelete(id, function (err, doccounttr) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        }
        if (!doccounttr) {
            return res.status(400).json({ message: 'Could not find DocCountTr.' });
        }
        else {
            return res.status(200).json({ message: 'DocCountTr has successfully been deleted.' });
        }
    });
});

module.exports = router;