const express = require('express');
const router = express.Router();
const Country = require('../../models/Country');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {

    Country.findOne({ code: req.body.code }).then(country => {
        if (country) {
            return res.status(400).json({
                message: fault(600).message
                //"600": "Country already exists",
            });
        } else {

            const newCountry = new Country({
                code: req.body.code,
                name: req.body.name
            });

            newCountry
                .save()
                .then(country => res.json(country))
                .catch(err => res.json(err));
        }
    });
});

module.exports = router;