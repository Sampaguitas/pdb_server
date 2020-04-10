const express = require('express');
const router = express.Router();
const Location = require('../../models/Location');

router.get('/', (req, res) => {
    Location.find({warehouseId: req.query.warehouseId})
    .exec(function (err, locations) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else {
            return res.status(200).json(locations);
        }
    });
});

module.exports = router;