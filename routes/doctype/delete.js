const express = require('express');
const router = express.Router();
const DocType = require('../../models/DocType');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocType.findByIdAndDelete(id, function (err, doctype) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured' });
        } else if (!doctype) {
            return res.status(400).json({ message: 'Could not find DocType.' });
        } else {
            return res.status(200).json({ message: 'DocType has successfully been deleted.' });
        }
    });
});

module.exports = router;