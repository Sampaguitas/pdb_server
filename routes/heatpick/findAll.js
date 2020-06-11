const express = require('express');
const router = express.Router();
const HeatPick = require('../../models/HeatPick');
const _ = require('lodash');

router.get('/', (req, res) => {
    HeatPick.find({projectId: req.query.projectId})
    .populate('heatloc')
    .exec(function (err, heatpicks) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else {
            return res.status(200).json(heatpicks);
        }
    });
});

module.exports = router;