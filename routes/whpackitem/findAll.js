const express = require('express');
const router = express.Router();
const WhPackItem = require('../../models/WhPackItem');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    WhPackItem.find(data, function (err, whpackitems) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else if (!whpackitems) {
            return res.status(400).json({ message: 'No whpackitem found.' });
        } else {
            return res.status(200).json(whpackitems);
        }
    });
});

module.exports = router;