const express = require('express');
const router = express.Router();
const HeatLoc = require('../../models/HeatLoc');
router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = decodeURI(req.query.id);
    
    HeatLoc.findByIdAndUpdate(id, { $set: data }, function (err, po) {
        if (err || !po) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else {
            return res.status(200).json({ message: 'HeatNr successfully updated.' });
        }
    });
});

module.exports = router;