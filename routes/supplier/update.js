const express = require('express');
const router = express.Router();
const Supplier = require('../../models/Supplier');

router.put('/', (req, res) => {
    
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = decodeURI(req.body[k]);
    });

    const id = decodeURI(req.query.id);
    
    Supplier.findByIdAndUpdate(id, { $set: data }, function (err, supplier) {
        if (!!err || !supplier) {
            return res.status(400).json({ message: 'Could not update supplier.' });
        } else {
            return res.status(200).json({ message: 'Supplier has been updated.' });
        }
    });
});

module.exports = router;
