const express = require('express');
const router = express.Router();
const Region = require('../../models/Region');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    Region.findByIdAndRemove(id, function (err, region) {
        if (!region) {
            return res.status(400).json({
                message: fault(2301).message
                //"2301": "Region does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(2303).message,
                //"2303": "Region has been deleted",
            });
        }
    });
});

module.exports = router;