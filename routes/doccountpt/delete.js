const express = require('express');
const router = express.Router();
const DocCountPt = require('../../models/DocCountPt');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountPt.findByIdAndDelete(id, function (err, doccountpt) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else  if (!doccountpt) {
            return res.status(400).json({ message: 'Could not find DocCountPt.' });
        } else {
            return res.status(200).json({ message: 'DocCountPt has successfully been deleted.' });
        }
    });
});

module.exports = router;