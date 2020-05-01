const express = require('express');
const router = express.Router();
const Transaction = require('../../models/Transaction');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    Transaction.find({projectId: req.query.projectId})
    .sort({
        locationId: 'asc',
        transDate: 'asc',
    })
    .populate([
        {
            path:'location',
            populate: {
                path: 'area',
                populate: {
                    path: 'warehouse'
                }
            }
        },
        {
            path: 'po'
        }
    ])
    .exec(function (err, transaction) {
        if (!transaction) {
            return res.status(400).json({ 
                message: fault(1204).message
                //"1204": "No transaction match",
            });
        }
        else {
            return res.json(transaction);
        }
    });
});

module.exports = router;