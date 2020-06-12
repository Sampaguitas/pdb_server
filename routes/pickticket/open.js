const express = require('express');
const router = express.Router();
const PickTicket = require('../../models/PickTicket');
const Transaction = require('../../models/Transaction');
const _ = require('lodash');

router.put('/', (req, res) => {

    let pickticketId = req.body.pickticketId;
    let myPromise = [];
    let nRejected = 0;
    let nDeleted = 0;
    if (!pickticketId) {
        return res.status(400).json({ message: 'pickticketId is missing.' });
    } else {
        Transaction.find({pickticketId: pickticketId}, function(err, transactions) {
            if(err) {
                return res.status(400).json({ message: 'An error has occured.' });
            } else if (_.isEmpty(transactions)) {
                return res.status(400).json({ message: 'Could not retreive transactions' });
            } else {
                transactions.map(transaction => {
                    myPromise.push(deleteTransaction(transaction._id));
                });
                Promise.all(myPromise).then(responces => {
                    responces.map(responce => {
                        if (responce.isRejected) {
                            nRejected++;
                        } else {
                            nDeleted++;
                        }
                    });
                });

                updatePickTicket(pickticketId).then( () => {
                    return res.status(nRejected ? 400 : 200).json({ message: `${nDeleted} transactions undone, ${nRejected} transactions rejected.` });
                }).catch( () => {
                    return res.status(400).json({ message: 'Picking Ticket could not be updated.' });
                });

            }
        });
    }
});

module.exports = router;

function deleteTransaction(transactionId) {
    return new Promise(function(resolve) {
        Transaction.findByIdAndDelete(transactionId, function(err) {
            if(err) {
                resolve({
                    isRejected: true
                });
            } else {
                resolve({
                    isRejected: false,
                });
            }
        });
    });
}

function updatePickTicket(pickticketId) {
    return new Promise(function(resolve, reject) {
        PickTicket.findByIdAndUpdate(pickticketId, {isProcessed: false}, function(err) {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
}