const express = require('express');
const router = express.Router();
const Heat = require('../../models/Heat');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    Heat.findByIdAndUpdate(req.query.id, { $set: data }, function (err) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else {
            return res.status(200).json({ message: 'Heat has been updated.' });
        }
    });
});

module.exports = router;
