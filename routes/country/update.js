const express = require('express');
const router = express.Router();
const Country = require('../../models/Country');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};

    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    const id = req.query.id
    Country.findByIdAndUpdate(id, { $set: data }, function (err, country) {
        if (!country) {
            return res.status(400).json({
                message: fault(601).message
                //"601": "Country does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(602).message
                //"602": "Country has been updated",
            });
        }
    });
});

module.exports = router;