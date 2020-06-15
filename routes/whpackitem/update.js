const express = require('express');
const router = express.Router();
const WhPackItem = require('../../models/WhPackItem');
const _ = require('lodash');
const ObjectId = require('mongodb').ObjectID;

router.put('/', (req, res) => {

    var data = {};
    const id = decodeURI(req.query.id);
    const parentId = decodeURI(req.query.parentId);

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    data.pickitemId = parentId;

    let query = id ? { _id: id } : { _id: new ObjectId() };
    let update = { $set: data };
    let options = { new: true, upsert: true };

    if (!!id || !!parentId) {
        WhPackItem.findOneAndUpdate(query, update, options, function(err, resWhPackItem) {
            if (err) {
                return res.status(400).json({ message: `Object could not be ${!id ? "created" : "updated."}`});
            } else {
                return res.status(200).json({ message: `Object has been ${!id ? "created" : "updated."}`});
            }
        });
    } else {
        return res.status(400).json({ message: 'Object Id and parent Id are missing.' });
    }
});

module.exports = router;
