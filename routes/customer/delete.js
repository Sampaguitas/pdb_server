const express = require('express');
const router = express.Router();
const Customer = require('../../models/Customer');
const fault = require('../../utilities/Errors')


router.delete('/', (req, res) => {
    const id = req.query.id
    Customer.findByIdAndRemove(id, function (err, customer) {
        if (!customer) {
            return res.status(400).json({
                message: fault(201).message
                // "201": "Customer does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(203).message
                // "203": "Customer has been deleted",
            });
        }
    });
});


module.exports = router;