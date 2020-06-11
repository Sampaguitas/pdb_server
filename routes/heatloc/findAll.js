const express = require('express');
const router = express.Router();
const HeatLoc = require('../../models/HeatLoc');
const _ = require('lodash');

router.get('/', (req, res) => {
    HeatLoc.find({projectId: req.query.projectId})
    .sort({
        cif: 'asc',
        heatNr: 'asc',
    })
    .populate('heatpicks')
    .exec(function (err, heatlocs) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else {
            return res.status(200).json(heatlocs);
        }
    });
});

module.exports = router;