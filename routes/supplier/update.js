const express = require('express');
const router = express.Router();
const Supplier = require('../../models/Supplier');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    const id = req.query.id
    Supplier.findByIdAndUpdate(id, { $set: data }, function (err, supplier) {
        if (!supplier) {
            return res.status(400).json({
                message: fault(1501).message
                //"1501": "Supplier does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1502).message
                //"1502": "Supplier has been updated",
            });
        }
    });
});

module.exports = router;
