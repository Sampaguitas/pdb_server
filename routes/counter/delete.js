const express = require('express');
const router = express.Router();
const Counter = require('../../models/Counter');

router.delete('/', (req, res) => {
    const id = req.query.id
    Counter.findByIdAndDelete(id, function (err, counter) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' }); 
        } else if (!counter) {
            return res.status(400).json({ message: 'Could not find Counter.' });
        } else {
            return res.status(200).json({ message: 'Counter has successfully been deleted.' });
        }
    });
});

module.exports = router;