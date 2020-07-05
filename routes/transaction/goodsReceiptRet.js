const express = require('express');
const router = express.Router();
const _ = require('lodash');
const Return = require('../../models/Return');
const Transaction = require('../../models/Transaction');

router.post('/', (req, res) => {

    let selectedIdsGr = req.body.selectedIdsGr;
    let projectId = req.query.projectId;
    let toLocation = req.body.toLocation;
    let transQty = req.body.transQty;
    let transDate = decodeURI(req.body.transDate);

    let poIds = [];
    let subIds = [];
    let returnIds = [];
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
            element.returnId && !returnIds.includes(element.returnId) && returnIds.push(element.returnId);
            element.certificateId && !certificateIds.includes(element.certificateId) && certificateIds.push(element.certificateId);
            element.packitemId && !packitemIds.includes(element.packitemId) && packitemIds.push(element.packitemId);
            element.collipackId && !collipackIds.includes(element.collipackId) && collipackIds.push(element.collipackId);
        });
        Return.find({_id: {$in: returnIds}})
        .populate([
            {
                path: 'po',
            },
            {
                path: 'transactions'
            }
        ])
        .exec(async function(err, returns) {
            if (err) {
                res.status(400).json({message: 'An error has occured.'});
            } else if (!returns) {
                res.status(400).json({message: 'Could not retrive returns.'});
            } else {
                returns.map(function (_return) {
                    myTransactions.push(saveTransaction(_return, transQty, transDate, toLocation, projectId));
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

function saveTransaction(_return, transQty, transDate, toLocation, projectId) {
    return new Promise(function(resolve) {
        let stockQty = getStockQty(_return);
        let qtyReturn = _return.qtyReturn || 0;
        transQty = transQty ? transQty : qtyReturn - stockQty;
        if (transQty > qtyReturn - stockQty) {
            resolve ({
                isRejected: true,
                isAdded: false,
            });
        } else {
            const newTransaction = new Transaction({
                transQty: transQty,
                transDate: transDate,
                transType: 'Return',
                transComment: `WayBill ${_return.waybillNr} item ${_return.waybillItem} Received: ${transQty} ${_return.po.uom}`,
                locationId: toLocation,
                poId: _return.poId,
                returnId: _return._id,
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

function getStockQty(_return) {
    return _return.transactions.reduce(function (acc, cur) {
        if (!!cur.transQty) {
            acc += cur.transQty;
        }
        return acc;
    }, 0);
}