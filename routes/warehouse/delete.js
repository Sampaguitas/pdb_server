const express = require('express');
const router = express.Router();
const Warehouse = require('../../models/Warehouse');
const _ = require('lodash');

router.delete('/', async (req, res) => {
    // const id = req.query.id
    const selectedIds = req.body.selectedIds
    let myPromises = [];
    let nRejected = 0;
    let nDeleted = 0;

    if (_.isEmpty(selectedIds)) {
        return res.status(400).json({message: 'You need to pass an Id.'});
    } else {
        selectedIds.map(selectedId => myPromises.push(removeWarehouse(selectedId)));
        
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

function removeWarehouse(id) {
    return new Promise(function(resolve) {
        condition = { _id: id};
        Warehouse.findOneAndDelete(condition, function (err) {
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