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
                res_no: 260,
                res_message: fault(260).message
                // "260": "customer does not exist"
            });
        }
        else {
            return res.status(200).json({
                res_no: 400,
                res_message: fault(400).message
                //400: "Success"
            });
        }
    });
});


module.exports = router;

//https://webapplog.com/express-js-and-mongoose-example-building-hackhall/