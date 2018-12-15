const express = require('express');
const router = express.Router();
const fault = require('../../utilities/Errors')
const Customer = require('../../models/Customer');

router.post('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });    

    Customer.findOne({ code: req.body.code }).then(customer => {
        if (customer) {
            return res.status(400).json({ error: 261, message: fault(261).message });
            //261: "customer Already exist"
        } else {

            const newCustomer = new Customer({
                code: req.body.code,
                name: req.body.name,
                address: req.body.address,
                city: req.body.city,
                zip: req.body.zip,
                country: req.body.country,
                phone: req.body.phone,
                fax: req.body.fax,
                email: req.body.email,
                vat_no: req.body.vat_no
            });

            newCustomer
                .save()
                .then(customer => res.json(customer))
                .catch(err => res.json(err));
        }
    });
});
module.exports = router;