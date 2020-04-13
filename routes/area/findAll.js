const express = require('express');
const router = express.Router();
const Area = require('../../models/Area');

router.get('/', (req, res) => {
    Area.find({warehouseId: req.query.warehouseId})
    .exec(function (err, areas) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else {
            return res.status(200).json(areas);
        }
    });
});

module.exports = router;