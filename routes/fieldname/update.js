const express = require('express');
const router = express.Router();
const FieldName = require('../../models/FieldName');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    
    var data = {};
    
    Object.keys(req.body).forEach(function (k) {
        if (req.body[k] == true || req.body[k] == false) {
            data[k] = req.body[k];
        } else {
            data[k] = decodeURI(req.body[k]);
        }
    });
    
    const id = decodeURI(req.query.id);
    FieldName.findByIdAndUpdate(id, { $set: data }, function (err, fieldname) {
        if (err) {
            return res.status(400).json({ message: 'Could not update fieldname.' });
        }
        else {
            return res.status(200).json({ message: 'Fieldname has been updated.' });
        }
    });
});

module.exports = router;
