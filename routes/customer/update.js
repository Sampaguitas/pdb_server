const express = require('express');
const router = express.Router();
const Customer = require('../../models/Customer');
const fault = require('../../utilities/Errors')

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    const id = req.query.id
    Customer.findByIdAndUpdate(id, { $set: data }, function (err, customer) {
        if (!customer) {
            return res.status(400).json({
                message: fault(201).message
                // "201": "Customer does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(202).message
                //"202": "Customer has been updated",
            });
        }
    });
});


module.exports = router;

//https://webapplog.com/express-js-and-mongoose-example-building-hackhall/