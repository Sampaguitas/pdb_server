const express = require('express');
const router = express.Router();
const Customer = require('../../models/Customer');
const fault = require('../../utilities/Errors')


router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    Customer.find(data, function (err, customer) {
        if (!customer) {
            return res.status(400).json({ error: 260, message: fault(260).message });
            // "260": "customer does not exist"
        }
        else {
            return res.json(customer);
        }
    });
});


module.exports = router;