const express = require('express');
const router = express.Router();
const Mir = require('../../models/Mir');
const _ = require('lodash');

router.get('/', (req, res) => {
    Mir.find({projectId: req.query.projectId})
    .sort({
        mir: 'asc',
    })
    .populate({
        path: 'miritems',
        options: {
            sort: {
                lineNr: 'asc'
            }
        }
    })
    .exec(function (err, mirs) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else {
            return res.status(200).json(mirs);
        }
    });
});

module.exports = router;