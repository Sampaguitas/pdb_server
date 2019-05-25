const express = require('express');
const router = express.Router();
const Region = require('../../models/Region');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
    Region.findOne({ name: req.body.name }).then(region => {
        if (region) {
            return res.status(400).json({
                message: fault(2300).message
                //"2300": "Region already exists",
            });
        } else {
            const newRegion = new Region({
                name: req.body.name,
            });

            newRegion
                .save()
                .then(region => res.json(region))
                .catch(err => res.json(err));
        }
    });
});
module.exports = router;