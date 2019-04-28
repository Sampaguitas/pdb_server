const express = require('express');
const router = express.Router();
const Locale = require('../../models/Locale');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
    Locale.findOne({ name: req.body.name }).then(locale => {
        if (locale) {
            return res.status(400).json({
                message: fault(0900).message
                //"0900": "Locale already exists",
            });
        } else {

            const newLocale = new Locale({
                name: req.body.name,
            });

            newLocale
                .save()
                .then(locale => res.json(locale))
                .catch(err => res.json(err));
        }
    });
});
module.exports = router;