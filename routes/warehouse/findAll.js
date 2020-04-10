const express = require('express');
const router = express.Router();
const Warehouse = require('../../models/Warehouse');

router.get('/', (req, res) => {
    Warehouse.find({projectId: req.query.projectId})
    .sort({
        name: 'asc',
    })
    .populate({
        path: 'locations',
        options: {
            sort: {
                name: 'asc'
            }
        }
    })
    .exec(function (err, warehouses) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else {
            return res.status(200).json(warehouses);
        }
    });
});

module.exports = router;