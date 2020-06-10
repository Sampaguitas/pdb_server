const express = require('express');
const router = express.Router();
const PickItem = require('../../models/PickItem');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = decodeURI(req.query.id);
    
    PickItem.findByIdAndUpdate(id, { $set: data }, function (err, pickitem) {
        if (err || !pickitem) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else {
            return res.status(200).json({ message: 'PickItem Successfully updated.' });
        }
    });
});

module.exports = router;