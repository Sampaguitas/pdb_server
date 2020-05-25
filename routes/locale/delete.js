const express = require('express');
const router = express.Router();
const Locale = require('../../models/Locale');

router.delete('/', (req, res) => {
    const id = req.query.id
    Locale.findByIdAndDelete(id, function (err, locale) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.'})
        } else if (!locale) {
            return res.status(400).json({  message: 'Could not find locale.' });
        } else {
            return res.status(200).json({ message: 'Locale has successfully been deleted.' });
        }
    });
});

module.exports = router;