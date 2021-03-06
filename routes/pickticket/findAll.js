const express = require('express');
const router = express.Router();
const PickTicket = require('../../models/PickTicket');
const _ = require('lodash');

router.get('/', (req, res) => {
    PickTicket.find({projectId: req.query.projectId})
    .sort({
        pickNr: 'asc',
    })
    .populate([
        {
            path: 'pickitems',
            populate: [
                {
                    path: 'miritem',
                    populate: {
                            path: 'po',
                    }
                },
                {
                    path: 'location',
                    populate: {
                        path: 'area',
                    }
                },
                {
                    path: 'whpackitems',
                }
            ]
        },
        {
            path: 'mir'
        },
        {
            path: 'warehouse'
        },
        {
            path: 'project'
        }
    ])
    .exec(function (err, picktickets) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else {
            return res.status(200).json(picktickets);
        }
    });
});

module.exports = router;