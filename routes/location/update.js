const express = require('express');
const router = express.Router();
const Location = require('../../models/Location');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = decodeURI(req.query.id);
    
    Location.findByIdAndUpdate(id, { $set: data }, function (err, location) {
        if (err || !location) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else {
            return res.status(200).json({ message: 'Location Successfully updated.' });
        }
    });
});

module.exports = router;