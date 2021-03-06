const express = require('express');
const router = express.Router();
const Warehouse = require('../../models/Warehouse');
const _ = require('lodash');

router.get('/', (req, res) => {
    Warehouse.find({projectId: req.query.projectId})
    .sort({
        warehouse: 'asc',
    })
    .populate({
        path: 'areas',
        options: {
            sort: {
                areaNr: 'asc'
            }
        },
        populate: {
            path: 'locations',
            options: {
                sort: {
                    hall: 'asc',
                    row: 'asc',
                    col: 'asc',
                    height: 'asc'
                }
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