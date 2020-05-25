const express = require('express');
const router = express.Router();
const DocCountPf = require('../../models/DocCountPf');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountPf.findByIdAndDelete(id, function (err, doccountpf) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!doccountpf) {
            return res.status(400).json({ message: 'Could not find DocCountPf.' });
        } else {
            return res.status(200).json({ message: 'DocCountPf has successfully been deleted.' });
        }
    });
});

module.exports = router;