const express = require('express');
const router = express.Router();
const Opco = require('../../models/Opco');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    Opco.findByIdAndRemove(id, function (err, opco) {
        if (!opco) {
            return res.status(400).json({
                message: fault(1001).message
                //"1001": "Opco does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1003).message
                //"1003": "Opco has been deleted",
            });
        }
    });
});

module.exports = router;