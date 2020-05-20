const express = require('express');
const router = express.Router();
const HeatLoc = require('../../models/HeatLoc');

router.post('/', (req, res) => {

    const { cif, heatNr, inspQty, locationId, poId, projectId } = req.body;

    HeatLoc.findOneAndUpdate({ projectId, poId, locationId }, {$set: { cif, heatNr, inspQty } }, { new: true, upsert: true, rawResult: true }, function (err, heatLoc) {
        if (err || !heatLoc) {
            res.status(400).json({message: 'HeatNr could not be assigned to this location'});
        } else {
            res.status(200).json({message: `HeatNr has successfully been ${heatLoc.lastErrorObject.updatedExisting ? "updated" : "created"}`});
        }
    });

});

module.exports = router;