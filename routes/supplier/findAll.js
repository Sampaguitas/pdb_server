const express = require('express');
const router = express.Router();
const Supplier = require('../../models/Supplier');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    Supplier.find({projectId: req.query.projectId})
    .sort({
        name: 'asc'
    })
    .exec(function (err, supplier) {
        if (!supplier) {
            return res.status(400).json({message: 'no suppliers where found.'});
        }
        else {
            return res.json(supplier);
        }
    });
});

module.exports = router;