const express = require('express');
const router = express.Router();
const WhPackItem = require('../../models/WhPackItem');
const _ = require('lodash');
const ObjectId = require('mongodb').ObjectID;

router.put('/', async (req, res) => {

    let nAdded = 0;
    let nEdited = 0;
    let nRejected = 0;

    let myPromises = [];

    const virtuals = req.body.virtuals;
    const pickitemId = req.query.pickitemId;
    const whpackitemId = req.query.whpackitemId;

    if (_.isUndefined(pickitemId)) {
        return res.status(400).json({message:'pickitemId is missing'});
    } else if (_.isEmpty(virtuals)) {
        return res.status(400).json({message:'Wrong virtuals format'});
    } else {
        switch(!whpackitemId){
            case true:
                //create all virtuals (no existing whpackitem)
                alterArray(virtuals, pickitemId, true).map(element => {
                    myPromises.push(upsert(element));
                });
                await Promise.all(myPromises).then(resMyPromises => {
                    resMyPromises.map(r => {
                        if(r.isRejected) {
                            nRejected++;
                        } else if (r.isAdded) {
                            nAdded++;
                        }
                    });
                    return res.status(nRejected > 0 ? 400 : 200).json({
                        message: `${nEdited} item(s) edited, ${nAdded} item(s) added, ${nRejected} item(s) rejected.`
                    });
                })
                .catch( () => {
                    return res.status(400).json({
                        message: `${nEdited} item(s) edited, ${nAdded} item(s) added, ${nRejected} item(s) rejected.`
                    });
                });
                break
            case false:
                //update first and update others (existing packitem)
                WhPackItem.findByIdAndUpdate(whpackitemId, { $set: virtuals[0]})
                .then( async () => {
                    nEdited++;
                    if(virtuals.length === 1) {
                        return res.status(200).json({ message: 'PackItem information was successfuly updated.' });
                    } else {
                        alterArray(virtuals, pickitemId, false).map(element => {
                            myPromises.push(upsert(element));
                        });
                        await Promise.all(myPromises).then(resMyPromises => {
                            resMyPromises.map(r => {
                                if(r.isRejected) {
                                    nRejected++;
                                } else if (r.isAdded) {
                                    nAdded++;
                                }
                            });
                            return res.status(nRejected > 0 ? 400 : 200).json({
                                message: `${nEdited} item(s) edited, ${nAdded} item(s) added, ${nRejected} item(s) rejected.`
                            });
                        })
                        .catch( () => {
                            return res.status(400).json({
                                message: `${nEdited} item(s) edited, ${nAdded} item(s) added, ${nRejected} item(s) rejected.`
                            });
                        });
                    }
                })
                .catch( () => {
                    return res.status(400).json({message:'PackItem information could not be updated'});
                });
                break;
        }
    }
});

module.exports = router;

function alterArray(virtuals, pickitemId, includingFirst) {
    if (!includingFirst) {
        virtuals.shift();
    }
    let tempObject = {};
    return virtuals.reduce(function (acc, curr) {
        tempObject = curr;
        tempObject.pickitemId = pickitemId;
        acc.push(tempObject);
        return acc;
    },[]);
}

function upsert (element) {
    return new Promise(function (resolve, reject) {
        let query = { _id: new ObjectId() };
        let update = { $set: element };
        let options = { new: true, upsert: true };
        WhPackItem.findOneAndUpdate(query, update, options, function(err) {
            if (err) {
                resolve({
                    isAdded: false,
                    isRejected: true,
                });
            } else {
                resolve({
                    isAdded: true,
                    isRejected: false
                });
            }
        });
    });
}