const express = require('express');
const router = express.Router();
const Heat = require('../../models/Heat');

router.delete('/', (req, res) => {
    const id = req.query.id
    Heat.findByIdAndDelete(id, function (err, heat) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!heat) {
            return res.status(400).json({ message: 'Could not find Heat.' });
        } else {
            return res.status(200).json({ message: 'Heat has successfully been deleted.' });
        }
    });
});

module.exports = router;