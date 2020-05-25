const express = require('express');
const router = express.Router();
const DocCountInspect = require('../../models/DocCountInspect');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountInspect.findByIdAndDelete(id, function (err, doccountinspect) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!doccountinspect) {
            return res.status(400).json({ message: 'Could not find DocCountInspect.' });
        } else {
            return res.status(200).json({ message: 'DocCountInspect has successfully been deleted.' });
        }
    });
});

module.exports = router;