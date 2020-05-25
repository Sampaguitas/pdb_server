const express = require('express');
const router = express.Router();
const Currency = require('../../models/Currency');

router.delete('/', (req, res) => {
    const id = req.query.id
    Currency.findByIdAndDelete(id, function (err, currency) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!currency) {
            return res.status(400).json({ message: 'Could not find Curreny.' });
        } else {
            return res.status(200).json({ message: 'Curreny has successfully been deleted.' });
        }
    });
});

module.exports = router;