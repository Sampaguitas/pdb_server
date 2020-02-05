const express = require('express');
const router = express.Router();
const Currency = require('../../models/Currency');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    Currency.findByIdAndRemove(id, function (err, currency) {
        if (!currency) {
            return res.status(400).json({
                message: 'Curreny does not exist'
                //"2201": "Curreny does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'Curreny has been deleted'
                //"2203": "Curreny has been deleted",
            });
        }
    });
});

module.exports = router;