const express = require('express');
const router = express.Router();
const Opco = require('../../models/Opco');
const fault = require('../../utilities/Errors')


router.delete('/', (req, res) => {
    const id = req.query.id
    Opco.findByIdAndRemove(id, function (err, opco) {
        if (!opco) {
            return res.status(400).json({
                res_no: 301,
                res_message: fault(301).message
                //"301": "OPCO does not exist",
            });
        }
        else {
            return res.status(200).json({
                res_no: 303,
                res_message: fault(303).message
                //"303": "OPCO has been deleted",
            });
        }
    });
});


module.exports = router;