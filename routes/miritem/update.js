const express = require('express');
const router = express.Router();
const MirItem = require('../../models/MirItem');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = decodeURI(req.query.id);
    
    MirItem.findByIdAndUpdate(id, { $set: data }, function (err, miritem) {
        if (err || !miritem) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else {
            return res.status(200).json({ message: 'MirItem Successfully updated.' });
        }
    });
});

module.exports = router;