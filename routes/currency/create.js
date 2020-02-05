const express = require('express');
const router = express.Router();
const Currency = require('../../models/Currency');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
    Currency.findOne({ name: req.body.name }).then(currency => {
        if (currency) {
            return res.status(400).json({
                message: 'Curreny already exists'
                //"2200": "Curreny already exists",
            });
        } else {

            const newCurrency = new Currency({
                code: req.body.code,
                name: req.body.name,
            });

            newCurrency
                .save()
                .then(currency => res.json(currency))
                .catch(err => res.json(err));
        }
    });
});
module.exports = router;