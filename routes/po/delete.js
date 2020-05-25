const express = require('express');
const router = express.Router();
const Po = require('../../models/Po');

router.delete('/', (req, res) => {
    const id = req.query.id
    Po.findByIdAndDelete(id, function (err, po) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!po) {
            return res.status(400).json({ message: 'Could not find Po.' });
        } else {
            return res.status(200).json({  message: 'Po has successfully been deleted.' });
        }
    });
});

module.exports = router;