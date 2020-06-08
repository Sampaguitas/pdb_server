const express = require('express');
const router = express.Router();
const _ = require('lodash');
const Po = require('../../models/Po');
const Transaction = require('../../models/Transaction');

router.post('/', (req, res) => {

    let selectedIdsGr = req.body.selectedIdsGr;
    let projectId = req.query.projectId;
    let toLocation = req.body.toLocation;
    let transQty = req.body.transQty;
    let transDate = decodeURI(req.body.transDate);

    let poIds = [];
    let subIds = [];
    let certificateIds = [];
    let packitemIds = [];
    let collipackIds = [];

    myTransactions=[];
    let nRejected = 0;
    let nAdded = 0;

    if (_.isUndefined(selectedIdsGr) || _.isEmpty(selectedIdsGr)) {
        res.status(400).json({message: 'Please select line(s)'});
    } else if (!projectId || !toLocation || !transDate) {
        res.status(400).json({message: 'projectId, location or transaction date is missing...'});
    }  else if (!!transQty && transQty < 0) {
        res.status(400).json({ message: 'Transaction quantity should be greater than 0.' });
    } else {

        selectedIdsGr.forEach(element => {
            element.poId && !poIds.includes(element.poId) && poIds.push(element.poId);
            element.subId && !subIds.includes(element.subId) && subIds.push(element.subId);
            element.certificateId && !certificateIds.includes(element.certificateId) && certificateIds.push(element.certificateId);
            element.packitemId && !packitemIds.includes(element.packitemId) && packitemIds.push(element.packitemId);
            element.collipackId && !collipackIds.includes(element.collipackId) && collipackIds.push(element.collipackId);
        });
        Po.find({_id: {$in: poIds}})
        .populate({
            path: 'transactions'
        })
        .exec(async function(err, pos) {
            if (err) {
                res.status(400).json({message: 'An error occured'});
            } else if (!pos) {
                res.status(400).json({message: 'Could not retrive pos'});
            } else {
                pos.map(function (po) {
                    myTransactions.push(saveTransaction(po, transQty, transDate, toLocation, projectId));
                });

                await Promise.all(myTransactions).then(resTransactions => {
                    resTransactions.map(function (resTransaction) {
                        if (resTransaction.isRejected) {
                            nRejected++;
                        } else {
                            nAdded++;
                        }

                    });
                    res.status(nRejected ? 400 : 200).json({ message: `${nAdded} line(s) received, ${nRejected} line(s) rejected.`});
                });
            }
        });
    }

});

module.exports = router;



function saveTransaction(po, transQty, transDate, toLocation, projectId) {
    return new Promise(function(resolve) {
        let stockQty = getStockQty(po);
        let poQty = po.qty || 0;
        transQty = transQty ? transQty : poQty - stockQty;
        if (transQty > poQty - stockQty) {
            resolve ({
                isRejected: true,
                isAdded: false,
            });
        } else {
            const newTransaction = new Transaction({
                transQty: transQty,
                transDate: transDate,
                transType: 'Receipt',
                transComment: `Received: ${transQty} ${po.uom}`,
                locationId: toLocation,
                poId: po._id,
                projectId: projectId
            });

            newTransaction.save()
            .then( () => resolve({
                isRejected: false,
                isAdded: true,
            }))
            .catch( () => resolve({
                isRejected: true,
                isAdded: false,
            }));
        }
    });
}

function getStockQty(po) {
    return po.transactions.reduce(function (acc, cur) {
        if (!!cur.transQty) {
            acc += cur.transQty;
        }
        return acc;
    }, 0);
}