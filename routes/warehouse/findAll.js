const express = require('express');
const router = express.Router();
const Warehouse = require('../../models/Warehouse');

router.get('/', (req, res) => {
    Warehouse.find({projectId: req.query.projectId})
    .sort({
        name: 'asc',
    })
    .populate({
        path: 'areas',
        options: {
            sort: {
                number: 'asc'
            }
        },
        populate: {
            path: 'locations',
            sort: {
                hall: 'asc',
                row: 'asc',
                col: 'asc',
                height: 'asc'
            }
        }
    })
    .exec(function (err, warehouses) {
        if (err) {
            return res.status(400).json({ message: 'An error has occured.' });
        } else {
            warehouses.forEach(warehouse => {
                warehouse.areas.forEach(area => {
                    area.locations.forEach(location => {
                        location.name = `${area.number}/${location.hall}${location.row}-${leadingChar(location.col, '0', 3)}${!!location.height ? '-' + location.height : ''}`
                    });
                });
            });
            return res.status(200).json(warehouses);
        }
    });
});

function leadingChar(string, char, length) {
    return string.toString().length > length ? string : char.repeat(length - string.toString().length) + string;
}

module.exports = router;