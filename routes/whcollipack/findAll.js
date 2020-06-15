const express = require('express');
const router = express.Router();
const WhColliPack = require('../../models/WhColliPack');

router.get('/', (req, res) => {
    WhColliPack.find({projectId: req.query.projectId})
    .sort({
        plNr: 'asc',
        colliNr: 'asc',
    })
    .exec(function (err, whcollipack){
        if (err) {
            return res.status(400).json({message: 'An error has occured.'});
        } else if (!whcollipack) {
            return res.status(400).json({message: 'No WhColliPack match.'});
        } else {
            return res.status(200).json(whcollipack);
        }
    });
});

module.exports = router;