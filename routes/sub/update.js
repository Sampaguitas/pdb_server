const express = require('express');
const router = express.Router();
const Sub = require('../../models/Sub');
const _ = require('lodash');

router.put('/', (req, res) => {
    var data = {};
    const id = req.query.id
    
    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    if (data.inspRelDate || data.relQty) {
        Sub.findById(id, function (err, sub) {
            if (!sub) {
                return res.status(400).json({ message: 'Could not update Sub information.' });
            } else {
                if (data.inspRelDate && sub.rfiQty && !sub.relQty) {
                    data.relQty = sub.rfiQty;
                } else if (data.relQty && !sub.inspRelDate) {
                    data.inspRelDate = new Date();
                }
                Sub.findByIdAndUpdate(id, { $set: data }, function (err, sub) {
                    if (!sub) {
                        return res.status(400).json({ message: 'Could not update Sub information.' });
                    }
                    else {
                        return res.status(200).json({ message: 'Sub has been updated.' });
                    }
                });
            }
        });
    } else {
        Sub.findByIdAndUpdate(id, { $set: data }, function (err, sub) {
            if (!sub) {
                return res.status(400).json({ message: 'Could not update Sub information.' });
            }
            else {
                return res.status(200).json({ message: 'Sub has been updated.' });
            }
        });
    }

    
    
});

module.exports = router;
