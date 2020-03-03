const express = require('express');
const router = express.Router();
const PackItem = require('../../models/PackItem');
const fault = require('../../utilities/Errors');
const _ = require('lodash');

router.put('/', (req, res) => {

    var data = {};
    const id = decodeURI(req.query.id);
    const parentId = decodeURI(req.query.parentId);

    if (id || parentId) {

        Object.keys(req.body).forEach(function (k) {
            data[k] = decodeURI(req.body[k]);
        });

        data.subId = parentId;

        PackItem.findByIdAndUpdate(id, { $set: data }, { upsert: true }, function(err, resPackitem) {
            if (err) {
                return res.status(400).json({ message: 'Object could not be updated.' });
            }
            else {
                return res.status(200).json({ message: 'Object has been updated.' });
            }
        });

    } else {
        return res.status(400).json({ message: 'Object Id or parent Id is missing.' }); 
    }
    
});

module.exports = router;
