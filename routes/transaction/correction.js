const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const _ = require('lodash');
const Location = require('../../models/Location');
const Transaction = require('../../models/Transaction');

router.post('/', (req, res) => {

    let projectId = req.query.projectId;
    let poId = req.body.poId;
    let locationId = req.body.locationId;
    let transQty = req.body.transQty;
    let transDate = decodeURI(req.body.transDate);

    if (!projectId || !poId || !locationId || !transQty || !transDate) {
        res.status(400).json({message: 'Project Id, poId, locationid, qty or date is missing...'});
    } else {
        Transaction.find({poId: poId, locationId: locationId})
        .populate('po', 'uom')
        .exec(function(errTrans, transactions) {
            if (errTrans) {
                res.status(400).json({message: 'An error occured.'});
            } else if (!transactions) {
                res.status(400).json({message: 'Could not retrive transactions.'});
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
                        let location = locations.find(element => element._id == locationId);
                        if (_.isUndefined(location)) {
                            res.status(400).json({message: 'Could not retreive location information.'})
                        } else {
                            //fields
                            let uom = transactions[0].po.uom;
                            let whName = location.area.warehouse.warehouse;
                            let areaNr = location.area.areaNr;
                            let locHall = location.hall;
                            let locRow = location.row;
                            let locCol = location.col;
                            let locHeight = location.height;
                            let locName = `${areaNr}/${locHall}${locRow}-${leadingChar(locCol, '0', 3)}${!!locHeight ? '-' + locHeight : ''}`;
                            //Document from
                            let newTransaction = new Transaction({
                                transQty: transQty,
                                transDate: transDate,
                                transType: 'Correction / Revalue',
                                transComment: `Correction / Revalue: ${transQty} ${uom}`,
                                locationId: locationId,
                                poId: poId,
                                projectId: projectId,
                            });
                            newTransaction.save()
                            .then( () => res.status(200).json({message: `${Math.abs(transQty)} ${uom} have beem ${transQty > 0 ? 'added' : 'removed'} from location: ${whName} ${locName}`}))
                            .catch( () => res.status(200).json({message: `Stock Qty could not be corrected/revaluated`}));
                        }
                    }
                });
            }
        });
    }

});

function leadingChar(string, char, length) {
    return string.toString().length > length ? string : char.repeat(length - string.toString().length) + string;
}

module.exports = router;