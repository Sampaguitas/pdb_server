const express = require('express');
const router = express.Router();
const Po = require('../../models/Po');

router.get('/', (req, res) => {
    Po.find({projectId: req.query.projectId})
    .sort({
        clPo: 'asc',
        clPoRev: 'asc',
        clPoItem: 'asc'
    })
    .populate([
        {
            path:'subs',
            populate: [
                {
                    path: 'packitems',
                },
                {
                    path: 'heats',
                    options: {
                        sort: {
                            heatNr: 'asc'
                        }
                    },
                    populate: {
                        path: 'certificate',
                    }
                }
            ]
                
        },
        {
            path: 'returns',
            populate: {
                path: 'heats',
                potions: {
                    sort: {
                        heatNr:'asc'
                    }
                },
                populate: {
                    path: 'certificate',
                }
            }
        }
    ])
    .exec(function (err, po) {
        if (err) {
            return res.status(400).json({  message: 'An error has occured.' });
        } else {
            return res.json(po);
        }
    });
});

module.exports = router;