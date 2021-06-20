const express = require('express');
const router = express.Router();
const PackItem = require('../../models/PackItem');
const _ = require('lodash');
const ObjectId = require('mongodb').ObjectID;

function alterArray(virtuals, projectId, poId, subId, includingFirst) {
    if (!includingFirst) {
        virtuals.shift();
    }
    let tempObject = {};
    return virtuals.reduce(function (acc, curr) {
        tempObject = curr;
        tempObject.projectId = projectId;
        tempObject.poId = poId;
        tempObject.subId = subId;
        acc.push(tempObject);
        return acc;
    },[]);
}

router.put('/', async (req, res) => {

    let nAdded = 0;
    let nEdited = 0;
    let nRejected = 0;

    let myPromises = [];

    const virtuals = req.body.virtuals;
    const projectId = req.query.projectId;
    const poId = req.query.poId;
    const subId = req.query.subId;
    const packitemId = req.query.packitemId;

    if (_.isUndefined(subId)) {
        return res.status(400).json({message:'SUB ID is missing'});
    } else if (_.isEmpty(virtuals)) {
        return res.status(400).json({message:'Wrong virtuals format'});
    } else {
        switch(!packitemId){
            case true:
                //create all virtuals (no existing packitem)
                alterArray(virtuals, projectId, poId, subId, true).map(element => {
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
                PackItem.findByIdAndUpdate(packitemId, { $set: virtuals[0]})
                .then( async () => {
                    nEdited++;
                    if(virtuals.length === 1) {
                        return res.status(200).json({ message: 'Sub information was successfuly updated.' });
                    } else {
                        alterArray(virtuals, projectId, poId, subId, false).map(element => {
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
                    return res.status(400).json({message:'Sub information could not be updated'});
                });
                break;
        }
    }
});

module.exports = router;

function upsert (element) {
    return new Promise(function (resolve, reject) {
        // let query = { _id: new ObjectId() }; new ObjectId()
        let query = new ObjectId();
        let update = { $set: element };
        let options = { new: true, upsert: true };
        // PackItem.findOneAndUpdate(query, update, options, function(err) {
        PackItem.findByIdAndUpdate(query, update, options, function(err) {
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