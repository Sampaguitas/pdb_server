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
            return res.status(400).json({ 
                res_no: 204,
                res_message: fault(204).message
                // "204": "No customer match",
            });
        }
        else {
            return res.json(customer);
        }
    });
});


module.exports = router;