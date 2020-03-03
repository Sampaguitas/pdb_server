const express = require('express');
const router = express.Router();
const Field = require('../../models/Field');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = decodeURI(req.query.id);
    
    Field.findByIdAndUpdate(id, { $set: data }, function (err, field) {
        if (err) {
            return res.status(400).json({ message: 'Could not update field.' });
        }
        else {
            return res.status(200).json({  message: 'Field has been updated.' });
        }
    });
});

module.exports = router;
