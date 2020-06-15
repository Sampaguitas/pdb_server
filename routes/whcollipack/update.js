const express = require('express');
const router = express.Router();
const WhColliPack = require('../../models/WhColliPack');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = req.query.id
    if (!data.hasOwnProperty('plNr') && !data.hasOwnProperty('colliNr')) {
        WhColliPack.findByIdAndUpdate(id, { $set: data }, { new: true }, function (err, whcollipack) {
            if (err) {
                return res.status(400).json({ message: 'An error has occured.' });
            } else if (!whcollipack) {
                return res.status(400).json({ message: 'WhColliPack does not exist.' });
            } else {
                return res.status(200).json({ message: 'WhColliPack has been updated.' });
            }
        });
    } else {
        return res.status(400).json({ message: 'plNr and colliNr cannot be edited.' });
    }
    
});

module.exports = router;
