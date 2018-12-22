const express = require('express');
const router = express.Router();
const Customer = require('../../models/Customer');
const fault = require('../../utilities/Errors')


router.get('/', (req, res) => {
    const id = req.query.id
    Customer.findById(id, function (err, customer) {
        if (!customer) {
            return res.status(400).json({ 
                res_no: 201,
                res_message: fault(201).message
                // "201": "Customer does not exist",
            });
        }
        else {
            return res.json(customer);
        }
    });
});


module.exports = router;