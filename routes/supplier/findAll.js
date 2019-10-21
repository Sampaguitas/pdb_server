const express = require('express');
const router = express.Router();
const Supplier = require('../../models/Supplier');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    // var data = {};
    // Object.keys(req.body).forEach(function (k) {
    //     data[k] = req.body[k];
    // });

    Supplier.find({projectId: req.query.projectId}, function (err, supplier) {
        if (!supplier) {
            return res.status(400).json({ 
                message: fault(1504).message
                //"1504": "No Supplier match",
            });
        }
        else {
            return res.json(supplier);
        }
    });
});

module.exports = router;