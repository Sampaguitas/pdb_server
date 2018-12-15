const express = require('express');
const router = express.Router();
const Opco = require('../../models/Opco');
const fault = require('../../utilities/Errors')


router.delete('/', (req, res) => {
    const id = req.query.id
    Opco.findByIdAndRemove(id, function (err, opco) {
        if (!opco) {
            return res.status(400).json({
                res_no: 260,
                res_message: fault(260).message
                // "260": "Opco does not exist"
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