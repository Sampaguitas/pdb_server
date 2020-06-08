const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const _ = require('lodash');
const Location = require('../../models/Location');
const Transaction = require('../../models/Transaction');

router.post('/', (req, res) => {

    let projectId = req.query.projectId;
    let poId = req.body.poId;
    let fromLocationId = req.body.fromLocation;
    let toLocationId = req.body.toLocation;
    let transQty = req.body.transQty;
    let transDate = decodeURI(req.body.transDate);

    if (!projectId || !poId || !fromLocationId || !toLocationId || !transDate) {
        res.status(400).json({message: 'projectId, poId, location or transaction date is missing...'});
    } else if (fromLocationId === toLocationId) {
        res.status(400).json({message: 'Please select another location...'});
    } else if (!!transQty && transQty < 0) {
        res.status(400).json({ message: 'Transaction quantity should be greater than 0.' });
    } else {
        Transaction.find({poId: poId, locationId: fromLocationId})
        .populate('po', 'uom')
        .exec(function(errTrans, transactions) {
            if (errTrans) {
                res.status(400).json({message: 'An error occured.'});
            } else if (!transactions) {
                res.status(400).json({message: 'Could not retrive transactions.'});
            } else {
                let stockQty = transactions.reduce(function (acc, cur) {
                    if (!!cur.transQty) {
                        acc += cur.transQty;
                    }
                    return acc;
                }, 0);
                if (transQty > stockQty) {
                    res.status(400).json({message: 'You cannot transfer more units than available in stock.'})
                } else {
                    Location.find({_id: { $in: [fromLocationId, toLocationId] } })
                    .populate({
                        path: 'area',
                        populate: 'warehouse'
                    })
                    .exec(async function(errLoc, locations) {
                        if (errLoc || !locations) {
                            res.status(400).json({message: 'Could not retreive location information.'});
                        } else {
                            let fromLocation = locations.find(element => element._id == fromLocationId);
                            let toLocation = locations.find(element => element._id == toLocationId);
                            if (_.isUndefined(fromLocation) || _.isUndefined(toLocation)) {
                                res.status(400).json({message: 'Could not retreive location information.'})
                            } else {
                                //common Fields
                                transQty = transQty ? transQty : stockQty;
                                let uom = transactions[0].po.uom;
                                let transferId = new mongoose.Types.ObjectId();
                                //from Fields
                                let fromWhName = fromLocation.area.warehouse.warehouse;
                                let fromAreaNr = fromLocation.area.areaNr;
                                let fromLocHall = fromLocation.hall;
                                let fromLocRow = fromLocation.row;
                                let fromLocCol = fromLocation.col;
                                let fromLocHeight = fromLocation.height;
                                let fromLocName = `${fromAreaNr}/${fromLocHall}${fromLocRow}-${leadingChar(fromLocCol, '0', 3)}${!!fromLocHeight ? '-' + fromLocHeight : ''}`;
                                //to Fields
                                let toWhName = toLocation.area.warehouse.warehouse;
                                let toAreaNr = toLocation.area.areaNr;
                                let toLocHall = toLocation.hall;
                                let toLocRow = toLocation.row;
                                let toLocCol = toLocation.col;
                                let toLocHeight = toLocation.height;
                                let toLocName = `${toAreaNr}/${toLocHall}${toLocRow}-${leadingChar(toLocCol, '0', 3)}${!!toLocHeight ? '-' + toLocHeight : ''}`;
                                //Document from
                                let trasferFrom = {
                                    transQty: - transQty,
                                    transDate: transDate,
                                    transType: 'Transfer',
                                    transComment: `Moved to location ${toWhName} ${toLocName}: -${transQty} ${uom}`,
                                    locationId: fromLocationId,
                                    poId: poId,
                                    projectId: projectId,
                                    transferId: transferId,
                                };
                                //Document to
                                let trasferTo = {
                                    transQty: transQty,
                                    transDate: transDate,
                                    transType: 'Transfer',
                                    transComment: `Moved from location ${fromWhName} ${fromLocName}: ${transQty} ${uom}`,
                                    locationId: toLocationId,
                                    poId: poId,
                                    projectId: projectId,
                                    transferId: transferId,
                                };
                                Transaction.insertMany([trasferFrom, trasferTo])
                                .then( () => res.status(200).json({ message: `${transQty} ${uom} ${transQty === 1 ? 'has' : 'have'} ben moved from ${fromWhName} ${fromLocName} to ${toWhName} ${toLocName}`}))
                                .catch( () => res.status(400).json({ message: `Units could not be moved from ${fromWhName} ${fromLocName} to ${toWhName} ${toLocName}`}));
                            }
                        }
                    });
                    
                }
            }
        });
    }

});

function leadingChar(string, char, length) {
    return string.toString().length > length ? string : char.repeat(length - string.toString().length) + string;
}

module.exports = router;