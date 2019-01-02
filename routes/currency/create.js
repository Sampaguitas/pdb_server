const express = require('express');
const router = express.Router();
const fault = require('../../utilities/Errors')
const Currency = require('../../models/Currency');

router.post('/', (req, res) => {

    Currency.findOne({ code: req.body.code }).then(currency => {
        if (currency) {
            return res.status(400).json({
                res_no: 300,
                res_message: fault(300).message
                //"400": "Currency already exists",
            });
        } else {

            const newCurrency = new Currency({
                name: req.body.name
            });

            newCurrency
                .save()
                .then(currency => res.json(currency))
                .catch(err => res.json(err));
        }
    });
});
module.exports = router;