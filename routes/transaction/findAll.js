const express = require('express');
const router = express.Router();
const Transaction = require('../../models/Transaction');

router.get('/', (req, res) => {
    Transaction.find({projectId: req.query.projectId})
    .sort({
        // locationId: 'asc',
        // transDate: 'asc',
        createdAt: 'asc',
    })
    .populate({
        path:'location',
        populate: {
            path: 'area',
            populate: {
                path: 'warehouse'
            }
        }
    })
    .exec(function (err, transaction) {
        if (!!err) {
            return res.status(400).json({ message: "An error has occured." }); 
        } else {
            return res.json(transaction);
        }
    });
});

module.exports = router;