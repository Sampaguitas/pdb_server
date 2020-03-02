const express = require('express');
const router = express.Router();
const PackItem = require('../../models/PackItem');
const _ = require('lodash');


function alterArray(virtuals, subId, includingFirst) {
    if (!includingFirst) {
        virtuals.shift();
    }
    let tempObject = {};
    return virtuals.reduce(function (acc, curr) {
        tempObject = curr;
        tempObject.subId = subId;
        acc.push(tempObject);
        return acc;
    },[]);
}

router.put('/', (req, res) => {

    const virtuals = req.body.virtuals;
    const subId = req.query.subId;
    const packItemId = req.query.packItemId;

    if (_.isUndefined(subId)) {
        return res.status(400).json({message:'SUB ID is missing'});
    } else if (_.isEmpty(virtuals)) {
        return res.status(400).json({message:'Wrong virtuals format'});
    } else {
        // if (packItemId === 'undefined'){
        switch(!packItemId){
            case true:
                //create all virtuals (no existing packitem)
                PackItem.insertMany(alterArray(virtuals, subId, true))
                .then( () => {
                    return res.status(200).json({ message: 'Sub lines where successfully created.' });
                })
                .catch( () => {
                    return res.status(400).json({message:'Sub lines could not be created.'});
                });
                break
            case false:
                //update first and update others (existing packitem)
                PackItem.findOneAndUpdate(packItemId, { $set: virtuals[0]})
                .then( () => {
                    if(virtuals.length === 1) {
                        return res.status(200).json({ message: 'Sub information was successfuly updated.' });
                    } else {
                        PackItem.insertMany(alterArray(virtuals, subId, false))
                        .then( () => {
                            return res.status(200).json({ message: 'Sub lines where successfully created / updated.' });
                        })
                        .catch( () => {
                            return res.status(400).json({message:'Sub information was updated however sub lines could not be created.'});
                        });
                    }
                })
                .catch( () => {
                    return res.status(400).json({message:'Sub information could not be updated'});
                });
                break;
        }
    }
});

module.exports = router;