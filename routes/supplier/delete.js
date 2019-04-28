const express = require('express');
const router = express.Router();
const Supplier = require('../../models/Supplier');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    Supplier.findByIdAndRemove(id, function (err, supplier) {
        if (!supplier) {
            return res.status(400).json({
                message: fault(1501).message
                //"1501": "Supplier does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1503).message
                //"1503": "Supplier has been deleted",
            });
        }
    });
});

module.exports = router;