const express = require('express');
const router = express.Router();
const Country = require('../../models/Country');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    Country.findById(id, function (err, country) {
        if (!country) {
            return res.status(404).json({
                message: fault(601).message
                //"601": "Country does not exist",
            });
        }
        else {
            return res.json(country);
        }
    });
});


module.exports = router;
