const express = require('express');
const router = express.Router();
const Opco = require('../../models/Opco');
const fault = require('../../utilities/Errors')

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    const id = req.query.id
    Opco.findByIdAndUpdate(id, { $set: data }, function (err, opco) {
        if (!opco) {
            return res.status(400).json({
                res_no: 260,
                res_message: fault(260).message
                // "260": "opco does not exist"
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