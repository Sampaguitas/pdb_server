const express = require('express');
const router = express.Router();
const Opco = require('../../models/Opco');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    Opco.find(data)
    .sort({
        regionId: 'asc',
        country: 'asc',
        city: 'asc',
        name: 'asc'
    })
    .populate({
        path: "region",
        // options: {
        //     sort: {
        //         name: 'asc'
        //     }
        // }
    })
    // .populate("projects")
    // .populate("locale")
    .exec( function (err, opco) {
        if (!opco) {
            return res.status(400).json({ 
                message: fault(1004).message
                //"1004": "No Opco match",
            });
        }
        else {
            return res.json(opco);
        }
    });
});

module.exports = router;