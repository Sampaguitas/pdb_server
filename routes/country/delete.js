const express = require('express');
const router = express.Router();
const Country = require('../../models/Country');
const fault = require('../../utilities/Errors');


router.delete('/', (req, res) => {
    const id = req.query.id
    Country.findByIdAndRemove(id, function (err, country) {
        if (!country) {
            return res.status(400).json({
                message: fault(601).message
                //"601": "Country does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(603).message,
                //"603": "Country has been deleted",
            });
        }
    });
});

module.exports = router;