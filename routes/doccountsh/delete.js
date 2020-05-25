const express = require('express');
const router = express.Router();
const DocCountSh = require('../../models/DocCountSh');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountSh.findByIdAndDelete(id, function (err, doccountsh) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!doccountsh) {
            return res.status(400).json({ message: 'Could not find DocCountSh.' });
        } else {
            return res.status(200).json({ message: 'DocCountSh has successfully been deleted.' });
        }
    });
});

module.exports = router;