const express = require('express');
const router = express.Router();
const ColliPack = require('../../models/ColliPack');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });
    
    const id = req.query.id;

    if (!data.hasOwnProperty('plNr') && !data.hasOwnProperty('colliNr')) {
        ColliPack.findByIdAndUpdate(id, { $set: data }, { new: true }, function (err, collipack) {
            if (err) {
                return res.status(400).json({ message: 'An error has occured.' });
            } else if (!collipack) {
                return res.status(400).json({ message: 'ColliPack does not exist.' });
            } else {
                return res.status(200).json({ message: 'ColliPack has been updated.' });
            }
        });
    } else {
        return res.status(400).json({ message: 'plNr and colliNr cannot be edited.' });
    }
    
});

module.exports = router;
