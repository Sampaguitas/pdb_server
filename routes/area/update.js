const express = require('express');
const router = express.Router();
const Area = require('../../models/Area');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = decodeURI(req.query.id);
    
    Area.findByIdAndUpdate(id, { $set: data }, function (err, area) {
        if (err || !area) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else {
            return res.status(200).json({ message: 'Area Successfully updated.' });
        }
    });
});

module.exports = router;