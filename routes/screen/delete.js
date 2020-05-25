const express = require('express');
const router = express.Router();
const Screen = require('../../models/Screen');

router.delete('/', (req, res) => {
    const id = req.query.id
    Screen.findByIdAndDelete(id, function (err, screen) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!screen) {
            return res.status(400).json({ message: 'Could not find Screen.'});
        } else {
            return res.status(200).json({ message: 'Screen has successfully been deleted.'});
        }
    });
});

module.exports = router;