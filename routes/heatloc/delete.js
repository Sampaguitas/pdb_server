const express = require('express');
const router = express.Router();
const HeatLoc = require('../../models/HeatLoc');
const _ = require('lodash');

router.delete('/', async (req, res) => {
    // const id = req.query.id
    const selectedIds = req.body.selectedIds;
    let myPromises = [];
    let nRejected = 0;
    let nDeleted = 0;

    if (_.isEmpty(selectedIds)) {
        return res.status(400).json({message: 'You need to pass an Id.'});
    } else {
        selectedIds.map(selectedId => myPromises.push(removeHeatLoc(selectedId)));
        
        await Promise.all(myPromises).then(function (resPromises) {
            resPromises.map(function (resPromise) {
                if (resPromise.isRejected) {
                    nRejected += nRejected + 1;
                } else {
                    nDeleted += nDeleted + 1;
                }
            });
            res.status(!!nRejected ? 400 : 200).json({message: `${nDeleted} item(s) deleted, ${nRejected} item(s) rejected.`});
        });
    }
});

function removeHeatLoc(id) {
    return new Promise(function(resolve) {
        condition = { _id: id};
        HeatLoc.findOneAndDelete(condition, function (err) {
            if(err) {
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

module.exports = router;