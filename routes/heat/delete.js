const express = require('express');
const router = express.Router();
const Heat = require('../../models/Heat');
const _ = require('lodash');

router.delete('/', async (req, res) => {
    let selectedIds = req.body.selectedIds;
    let myPromises = [];
    let nRejected = 0;
    let nDeleted = 0;
    if (_.isEmpty(selectedIds)) {
        res.status(400).json({message: 'You need to pass an Id.'})
    } else {
        selectedIds.map(selectedId => myPromises.push(removeHeat(selectedId)));
        await Promise.all(myPromises).then(results => {
            results.map(result => {
                if (result.isRejected) {
                    nRejected++;
                } else {
                    nDeleted++;
                }
            });
            res.status(!!nRejected ? 400 : 200).json({ message: `${nDeleted} heats deleted, ${nRejected} heats deleted.`})
        });
    }
});

module.exports = router;

function removeHeat(selectedId) {
    return new Promise(function (resolve) {
        Heat.findByIdAndDelete(selectedId, function (err) {
            if (err) {
                resolve({
                    isRejected: true
                });
            } else {
                resolve({
                    isRejected: false
                });
            }
        });
    });
}