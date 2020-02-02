const express = require('express');
const router = express.Router();
const Po = require('../../models/Po');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    Po.find({projectId: req.query.projectId})
    .sort({
        clPo: 'asc',
        clPoRev: 'asc',
        clPoItem: 'asc'
    })
    .populate({
        path:'subs',
        populate: {
            path: 'certificates'
        },
        populate: {
            path: 'packitems',
            options: {
                sort: { 
                    'plNr': 'asc',
                    'colliNr': 'asc'
                }
            }
        }
    })
    .exec(function (err, po) {
        if (!po) {
            return res.status(400).json({ 
                message: fault(1204).message
                //"1204": "No Po match",
            });
        }
        else {
            return res.json(po);
        }
    });
});

module.exports = router;