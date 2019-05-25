const express = require('express');
const router = express.Router();
const Region = require('../../models/Region');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    Region.findById(id, function (err, region) {
        if (!region) {
            return res.status(404).json({
                message: fault(2301).message
                //"2301": "Region does not exist",
            });
        }
        else {
            return res.json(region);
        }
    });
});


module.exports = router;
