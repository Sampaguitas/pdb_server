const express = require('express');
const router = express.Router();
const PickTicket = require('../../models/PickTicket');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = decodeURI(req.query.id);
    
    PickTicket.findByIdAndUpdate(id, { $set: data }, function (err, pickticket) {
        if (err || !pickticket) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else {
            return res.status(200).json({ message: 'PickTicket Successfully updated.' });
        }
    });
});

module.exports = router;