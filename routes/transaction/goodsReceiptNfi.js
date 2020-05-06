const express = require('express');
const router = express.Router();
const _ = require('lodash');
const Sub = require('../../models/Sub');
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
        res.status(400).json({message: 'Project Id, location or transaction date is missing...'});
    } else {

        selectedIdsGr.forEach(element => {
            element.poId && !poIds.includes(element.poId) && poIds.push(element.poId);
            element.subId && !subIds.includes(element.subId) && subIds.push(element.subId);
            element.certificateId && !certificateIds.includes(element.certificateId) && certificateIds.push(element.certificateId);
            element.packitemId && !packitemIds.includes(element.packitemId) && packitemIds.push(element.packitemId);
            element.collipackId && !collipackIds.includes(element.collipackId) && collipackIds.push(element.collipackId);
        });
        Sub.find({_id: {$in: subIds}})
        .populate([
            {
                path: 'po',
            },
            {
                path: 'transactions'
            }
        ])
        .exec(async function(err, subs) {
            if (err) {
                res.status(400).json({message: 'An error occured'});
            } else if (!subs) {
                res.status(400).json({message: 'Could not retrive subs'});
            } else {
                subs.map(function (sub) {
                    myTransactions.push(saveTransaction(sub, transQty, transDate, toLocation, projectId));
                });

                await Promise.all(myTransactions).then(resTransactions => {
                    resTransactions.map(function (resTransaction) {
                        if (resTransaction.isRejected) {
                            nRejected++;
                        } else {
                            nAdded++;
                        }

                    });
                    res.status(nRejected ? 400 : 200).json({ message: `${nAdded} line(s) recived, ${nRejected} line(s) rejected.`});
                });
            }
        });
    }

});

module.exports = router;



function saveTransaction(sub, transQty, transDate, toLocation, projectId) {
    return new Promise(function(resolve) {
        let stockQty = getStockQty(sub);
        let relQty = sub.relQty || 0;
        transQty = transQty ? transQty : relQty - stockQty;
        if (transQty > packedQty - stockQty) {
            resolve ({
                isRejected: true,
                isAdded: false,
            });
        } else {
            const newTransaction = new Transaction({
                transQty: transQty,
                transDate: transDate,
                transType: 'Reciept',
                transComment: `NFI ${sub.nfi} Recived: ${transQty} ${sub.po.uom}`,
                locationId: toLocation,
                poId: sub.poId,
                subId: sub._id,
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

function getStockQty(sub) {
    return sub.transactions.reduce(function (acc, cur) {
        if (!!cur.transQty) {
            acc += cur.transQty;
        }
        return acc;
    }, 0);
}