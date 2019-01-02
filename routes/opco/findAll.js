const express = require('express');
const router = express.Router();
const Opco = require('../../models/Opco');
const fault = require('../../utilities/Errors')


router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    Opco.find(data, function (err, opco) {
        if (!opco) {
            return res.status(400).json({ 
                message: fault(304).message
                //"304": "No OPCO match",
            });
        }
        else {
            return res.json(opco);
        }
    });
});


module.exports = router;