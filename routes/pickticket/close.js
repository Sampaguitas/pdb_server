const express = require('express');
const router = express.Router();
const PickTicket = require('../../models/PickTicket');
const Transaction = require('../../models/Transaction');
const _ = require('lodash');

router.put('/', (req, res) => {

    let pickticketId = req.body.pickticketId;
    let transDate = new Date();
    let myPromise = [];
    let nRejected = 0;
    let nAdded = 0;
    if (!pickticketId) {
        return res.status(400).json({ message: 'pickticketId is missing.' });
    } else {
        PickTicket.findById(pickticketId)
        .populate({
            path: 'pickitems',
            populate: {
                path: 'miritem',
                populate: [
                    {
                        path: 'mir'
                    },
                    {
                        path: 'po'
                    }
                ]
            }
        })
        .exec(function (err, pickticket) {
            if (err) {
                return res.status(400).json({ message: 'An error has occured.' });
            } else if (!pickticket) {
                return res.status(400).json({ message: 'Could not find the Picking Ticket.' });
            } else if (!!pickticket.isProcessed) {
                return res.status(400).json({ message: 'Picking Ticket has already been closed.' });
            } else if (_.isEmpty(pickticket.pickitems)) {
                return res.status(400).json({ message: 'The Picking Ticket appears to be empty.' });
            } else {
                let validation = pickticket.pickitems.reduce(function(acc, cur) {
                    if(!cur.qtyPrepared || cur.qtyPrepared < 0) {
                        acc.qtyPrepared = false;
                    }
                    if(!cur.qtyPicked || cur.qtyPicked < 0) {
                        acc.qtyPicked = false;
                    }
                    return acc;
                }, {
                    qtyPrepared: true,
                    qtyPicked: true,
                });
                if (!validation.qtyPrepared) {
                    return res.status(400).json({ message: 'qtyPrepared cannot be null.' });
                } else if (!validation.qtyPicked) {
                    return res.status(400).json({ message: 'qtyPicked cannot be null.' });
                } else {
                    pickticket.pickitems.map(pickitem => {
                        myPromise.push(createTransaction(pickticket, pickitem, transDate));
                    });
        
                    Promise.all(myPromise).then(responces => {
                        
                        responces.map(responce => {
                            if (responce.isRejected) {
                                nRejected++;
                            } else {
                                nAdded++;
                            }
                        });
        
                        updatePickTicket(pickticketId).then( () => {
                            return res.status(nRejected ? 400 : 200).json({ message: `${nAdded} transactions created, ${nRejected} transactions rejected.` });
                        }).catch( () => {
                            return res.status(400).json({ message: 'Picking Ticket could not be updated.' });
                        });
        
                    });
                }
            }
        });
    }
});

module.exports = router;

function createTransaction(pickticket, pickitem, transDate) {
    return new Promise(function(resolve) {
        let newTransaction = new Transaction({
            transQty: -pickitem.qtyPicked,
            transDate: transDate,
            transType: 'Picking Ticket',
            transComment: `MIR ${pickitem.miritem.mir.mir} line ${pickitem.miritem.lineNr} Picking Ticket ${pickticket.pickNr}: ${pickitem.qtyPicked} ${pickitem.miritem.po.uom}`,
            locationId: pickitem.locationId,
            poId: pickitem.miritem.poId,
            projectId: pickticket.projectId,
            pickticketId: pickticket._id
        });

        newTransaction
        .save()
        .then( () => resolve({
            isRejected: false,
        }))
        .catch( () => resolve({
            isRejected: true
        }));
    });
}

function updatePickTicket(pickticketId) {
    return new Promise(function(resolve, reject) {
        PickTicket.findByIdAndUpdate(pickticketId, {isProcessed: true}, function(err) {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
}