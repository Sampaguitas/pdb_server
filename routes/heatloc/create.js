const express = require('express');
const router = express.Router();
const HeatLoc = require('../../models/HeatLoc');
const _ = require('lodash');

router.post('/', async (req, res) => {

    const documents = req.body.documents;
    let myPromises = [];
    let nRejected = 0;
    let nEdited = 0;
    let nAdded = 0;
    if (!_.isEmpty(documents)) {
        
        documents.forEach(document => {
            myPromises.push(upsert(document));
        });
    
        await Promise.all(myPromises).then(results => {
            results.forEach(result => {
                if (result.isRejected) {
                    nRejected++;
                } else if (result.isEdited) {
                    nEdited++;
                } else {
                    nAdded++;
                }
            });
            res.status(!!nRejected ? 400 : 200).json({
                message: `${nAdded} lines created, ${nEdited} lines updated, ${nRejected} lines rejected.`
            });
        });

    } else {
        res.status(400).json({ message: 'No documents to be created / updated.'})
    }
});

module.exports = router;

function upsert(document) {
    return new Promise(function(resolve) {
        let filter = { projectId: document.projectId, poId: document.poId, locationId: document.locationId, cif: document.cif, heatNr: document.heatNr };
        let update = { $inc: { inspQty: document.inspQty } };
        HeatLoc.findOneAndUpdate(filter, update, { new: true, upsert: true, rawResult: true }, function (err, heatLoc) {
            if (err || !heatLoc) {
                resolve({
                    isRejected: true,
                    isEdited: false,
                    isAdded: false,
                });
            } else if (heatLoc.lastErrorObject.updatedExisting) {
                resolve({
                    isRejected: false,
                    nEdited: true,
                    nAdded: false,
                });
            } else {
                resolve({
                    isRejected: false,
                    nEdited: false,
                    nAdded: true,
                });
            }
        });
    });
}