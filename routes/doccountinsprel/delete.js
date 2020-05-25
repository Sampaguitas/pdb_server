const express = require('express');
const router = express.Router();
const DocCountInsprel = require('../../models/DocCountInsprel');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountInsprel.findByIdAndDelete(id, function (err, doccountinsprel) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!doccountinsprel) {
            return res.status(400).json({ message: 'Could not find DocCountInsprel.' });
        } else {
            return res.status(200).json({ message: 'DocCountInsprel has successfully been deleted.' });
        }
    });
});

module.exports = router;