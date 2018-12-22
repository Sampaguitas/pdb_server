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
                res_no: 301,
                res_message: fault(301).message
                //"301": "OPCO does not exist",
            });
        }
        else {
            return res.status(200).json({
                res_no: 302,
                res_message: fault(302).message
                //"302": "OPCO has been updated",
            });
        }
    });
});


module.exports = router;

//https://webapplog.com/express-js-and-mongoose-example-building-hackhall/