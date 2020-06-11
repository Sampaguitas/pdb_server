const express = require('express');
const router = express.Router();
const HeatPick = require('../../models/HeatPick');
router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = decodeURI(req.query.id);
    
    HeatPick.findByIdAndUpdate(id, { $set: data }, function (err, heatpick) {
        if (err || !heatpick) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else {
            return res.status(200).json({ message: 'Item successfully updated.' });
        }
    });
});

module.exports = router;