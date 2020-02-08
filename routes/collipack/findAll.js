const express = require('express');
const router = express.Router();
const ColliPack = require('../../models/ColliPack');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    ColliPack.find({projectId: req.query.projectId})
    .sort({
        plNr: 'asc',
        colliNr: 'asc',
    })
    .exec(function (err, collipack){
        if (!collipack) {
            return res.status(400).json({message: 'No ColliPack match'});
        }
        else {
            return res.json(collipack);
        }
    });
});

module.exports = router;