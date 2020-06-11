const express = require('express');
const router = express.Router();
const HeatPick = require('../../models/HeatPick');
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
                message: `${nAdded} item(s) created, ${nEdited} item(s) updated, ${nRejected} item(s) rejected.`
            });
        });

    } else {
        res.status(400).json({ message: 'No items to be created / updated.'})
    }
});

module.exports = router;

function upsert(document) {
    return new Promise(function(resolve) {
        let filter = { heatlocId: document.heatlocId, pickitemId: document.pickitemId };
        let update = { $inc: { pickQty: document.pickQty } };
        HeatPick.findOneAndUpdate(filter, update, { new: true, upsert: true, rawResult: true }, function (err, heatpick) {
            if (err || !heatpick) {
                resolve({
                    isRejected: true,
                    isEdited: false,
                    isAdded: false,
                });
            } else if (heatpick.lastErrorObject.updatedExisting) {
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