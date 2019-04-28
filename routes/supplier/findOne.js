const express = require('express');
const router = express.Router();
const Supplier = require('../../models/Supplier');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    Supplier.findById(id, function (err, supplier) {
        if (!supplier) {
            return res.status(400).json({ 
                message: fault(1501).message
                //"1501": "Supplier does not exist",
            });
        }
        else {
            return res.json(supplier);
        }
    });
});

module.exports = router;