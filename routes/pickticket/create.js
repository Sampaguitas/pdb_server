const express = require('express');
const router = express.Router();
const MirItem = require('../../models/MirItem');
const PickTicket = require('../../models/PickTicket');
const PickItem = require('../../models/PickItem');
const mongoose = require('mongoose');
const _ = require('lodash');

router.post('/', (req, res) => {
    let projectId = req.body.projectId;
    let mirId = req.body.mirId;
    let warehouseIds = req.body.warehouseIds;
    let pickticketPromise = [];
    let nRejected = 0;
    let nAdded = 0;
    let nItemRejected = 0;
    let nItemAdded = 0;

    if (!projectId) {
        res.status(400).json({
            message: 'projectId is missing.',
            logs: []
        });
    } else if (!mirId) {
        res.status(400).json({
            message: 'mirId is missing.',
            logs: []
        });
    } else if (!warehouseIds || _.isEmpty(warehouseIds)) {
        res.status(400).json({
            message: 'warehouseIds are missing',
            logs: []
        });
    } else {
        MirItem.find({ mirId: mirId })
        .sort({'lineNr': 'asc'})
        .populate([
            {
                path: 'pickitems',
            },
            {
                path: 'po',
                populate: {
                    path: 'transactions',
                    populate: {
                        path: 'location',
                        populate: {
                            path: 'area',
                            populate: {
                                path: 'warehouse'
                            }
                        }
                    }
                }
            }
        ])
        .exec(function (err, miritems) {
            if (err) {
                res.status(400).json({
                    message: 'An error has occured.',
                    logs: []
                }); 
            } else if (_.isEmpty(miritems)) {
                res.status(400).json({
                    message: 'Could not retreive miritems.',
                    logs: []
                });
            } else {
                let tempObject = miritems.reduce(function (acc, cur) {
                    
                    let qtyRequired = cur.qtyRequired || 0;
                    
                    let qtyAlPicked = cur.pickitems.reduce(function (accPickitems, curPickitems) {
                        accPickitems += curPickitems.qtyPicked || 0;
                        return accPickitems;
                    }, 0);

                    let qtyTbPicked = Math.max(qtyRequired - qtyAlPicked, 0);
                    let qtyRemaining = Math.max(qtyRequired - qtyAlPicked, 0);
                    
                    if (!_.isEmpty(cur.po.transactions)) {
                        
                        let locations = cur.po.transactions.reduce( function (accTransaction, curTransaction) {
                            if (warehouseIds.includes(String(curTransaction.location.area.warehouseId))) {
                                let foundLocation = accTransaction.find(element => {
                                    return _.isEqual(element._id, curTransaction.locationId)
                                });
                                if (!_.isUndefined(foundLocation)) {
                                    foundLocation.stockQty += curTransaction.transQty;
                                } else {
                                    accTransaction.push({
                                        _id: curTransaction.locationId,
                                        warehouseId: curTransaction.location.area.warehouseId,
                                        stockQty: curTransaction.transQty
                                    });
                                }
                            }
                            return accTransaction;
                        }, []);

                        if (!_.isEmpty(locations)) {
                            locations.map(location => {
                                if (qtyRemaining > 0) {
                                    let foundPickTicket = acc.ptArray.find(element => _.isEqual(element.warehouseId, location.warehouseId));
                                    if (!_.isUndefined(foundPickTicket)) {
                                        foundPickTicket.pickitems.push({
                                            qtyPrepared: Math.min(qtyRemaining, location.stockQty),
                                            miritemId: cur._id,
                                            locationId: location._id,
                                            pickticketId: foundPickTicket._id
                                        });
                                        qtyRemaining -= Math.min(qtyRemaining, location.stockQty);
                                    } else {
                                        let pickticketId = mongoose.Types.ObjectId();
                                        acc.ptArray.push({
                                            _id: pickticketId,
                                            mirId: mirId,
                                            warehouseId: location.warehouseId,
                                            projectId: projectId,
                                            pickitems: [
                                                {
                                                    qtyPrepared: Math.min(qtyRemaining, location.stockQty),
                                                    miritemId: cur._id,
                                                    locationId: location._id,
                                                    pickticketId: pickticketId,
                                                }
                                            ]

                                        });
                                        qtyRemaining -= Math.min(qtyRemaining, location.stockQty);
                                    }
                                }
                            });
                        }
                        acc.logArray.push({
                            lineNr: cur.lineNr,
                            qtyRequired: qtyRequired,
                            qtyAlPicked: qtyAlPicked,
                            qtyTbPicked: qtyTbPicked,
                            qtyPrepared: qtyTbPicked - qtyRemaining,
                            qtyRemaining: qtyRemaining,
                        })
                    }

                    return acc;
                }, {
                    logArray: [],
                    ptArray: [],
                });
                tempObject.ptArray.map(pickticket => pickticketPromise.push(savePickTicket(pickticket)));
                Promise.all(pickticketPromise).then(results => {
                    results.map(result => {
                        if (result.isRejected) {
                            nRejected++;
                        } else {
                            nAdded++;
                            nItemAdded += result.nAdded;
                            nItemRejected += result.nRejected;
                        }
                    });
                    res.status(!!nRejected || !!nItemRejected ? 400 : 200).json({
                        message: `${nAdded} packing ticket added, ${nRejected} rejected - ${nItemAdded} packitems added, ${nItemRejected} rejected.`,
                        logs: tempObject.logArray
                    });
                })
            }
        });
    }
});

module.exports = router;

function savePickTicket(pickticket) {
    return new Promise(function (resolve) {
        let pickitemPromise = [];
        let nRejected = 0;
        let nAdded = 0;

        const newPickTicket = new PickTicket({
            _id: pickticket._id,
            mirId: pickticket.mirId,
            warehouseId: pickticket.warehouseId,
            projectId: pickticket.projectId,
        });

        newPickTicket.save()
        .then( () => {
            pickticket.pickitems.forEach(pickitem => pickitemPromise.push(savePickItem(pickitem)));
            Promise.all(pickitemPromise).then(results => {
                results.map(result => {
                    if (result.isRejected) {
                        nRejected++;
                    } else {
                        nAdded++;
                    }
                });
                resolve({
                    isRejected: false,
                    nRejected: nRejected,
                    nAdded: nAdded
                })
            });
        })
        .catch( () => resolve({ isRejected: true }));
    });
}

function savePickItem(pickitem) {
    return new Promise(function (resolve) {

        const newPickItem = new PickItem({
            qtyPrepared: pickitem.qtyPrepared,
            miritemId: pickitem.miritemId,
            locationId: pickitem.locationId,
            pickticketId: pickitem.pickticketId,
        });

        newPickItem.save()
        .then( () => resolve({ isRejected: false }))
        .catch( () => resolve({ isRejected: true }));
    });
}