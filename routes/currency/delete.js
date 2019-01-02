const express = require('express');
const router = express.Router();
const Currency = require('../../models/Currency');
const fault = require('../../utilities/Errors')


router.delete('/', (req, res) => {
    const id = req.query.id
    Currency.findByIdAndRemove(id, function (err, currency) {
        if (!currency) {
            return res.status(400).json({
                message: fault(401).message
                //"401": "Currency does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(103).message,
                //"403": "Currency has been deleted",
            });
        }
    });
});

module.exports = router;