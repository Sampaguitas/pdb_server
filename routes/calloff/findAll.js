const express = require('express');
const router = express.Router();
const CallOff = require('../../models/CallOff');
const _ = require('lodash');

router.get('/', (req, res) => {
    CallOff.find({projectId: req.query.projectId})
    .sort({
        mirNr: 'asc',
    })
    .populate({
        path: 'mirs',
        options: {
            sort: {
                lineNr: 'asc'
            }
        }
    })
    .exec(function (err, calloffs) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else {
            return res.status(200).json(calloffs);
        }
    });
});

module.exports = router;