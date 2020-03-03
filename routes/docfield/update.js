const express = require('express');
const router = express.Router();
const DocField = require('../../models/DocField');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = decodeURI(req.query.id);

    DocField.findByIdAndUpdate(id, { $set: data }, function (err, docfield) {
        if (err) {
            return res.status(400).json({ message: 'Docfield could not be updated.' });
        }
        else {
            return res.status(200).json({ message: 'Docfield has been updated.' });
        }
    });
});

module.exports = router;
