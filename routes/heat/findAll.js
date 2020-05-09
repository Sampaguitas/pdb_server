const express = require('express');
const router = express.Router();
const Heat = require('../../models/Heat');

router.get('/', (req, res) => {

    Heat.find({ projectId: req.query.projectId})
    .sort({
        heatNr: 'asc'
    })
    .exec(function (err, heats) {
        if (err) {
            return res.status(400).json({ message: 'Heats could not be retreived.' })
        } else {
            return res.json(heats);
        }
    });
});

module.exports = router;