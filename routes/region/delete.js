const express = require('express');
const router = express.Router();
const Region = require('../../models/Region');

router.delete('/', (req, res) => {
    const id = req.query.id
    Region.findByIdAndDelete(id, function (err, region) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.'})
        } else if (!region) {
            return res.status(400).json({ message: 'Could not find Region.' });
        } else {
            return res.status(200).json({ message: 'Region has successfully been deleted.'})
        }
    });
});

module.exports = router;