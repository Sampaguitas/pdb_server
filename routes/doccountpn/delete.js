const express = require('express');
const router = express.Router();
const DocCountPn = require('../../models/DocCountPn');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountPn.findByIdAndDelete(id, function (err, doccountpn) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else  if (!doccountpn) {
            return res.status(400).json({ message: 'Could not find DocCountPn.' });
        } else {
            return res.status(200).json({ message: 'DocCountPn has successfully been deleted.' });
        }
    });
});

module.exports = router;