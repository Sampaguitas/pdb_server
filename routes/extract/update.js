const express = require('express');
const router = express.Router();
const Po = require('../../models/Po');
const Sub = require('../../models/Sub');
const Certificate = require('../../models/Certificate');
const PackItem = require('../../models/PackItem');
const ColliPack = require('../../models/ColliPack');
const _ = require('lodash');
const ObjectId = require('mongodb').ObjectID;

router.put('/', async (req, res) => {

    let collection = req.body.collection;
    let fieldName = req.body.fieldName;
    let fieldValue = decodeURI(req.body.fieldValue);
    let rfiDateAct = decodeURI(req.body.rfiDateAct);
    let selectedIds = req.body.selectedIds;

    let poIds = [];
    let subIds = [];
    let certificateIds = [];
    let packItemIds = [];
    let colliPackIds = [];

    let myPromises = [];
    let nEdited = 0;
    let nAdded = 0;
    let nRejected = 0;

    if (!_.isUndefined(selectedIds) && !_.isEmpty(selectedIds) && !!collection || !!fieldName ) {

        selectedIds.forEach(element => {
            element.poId && !poIds.includes(element.poId) && poIds.push(element.poId);
            element.subId && !subIds.includes(element.subId) && subIds.push(element.subId);
            element.certificateId && !certificateIds.includes(element.certificateId) && certificateIds.push(element.certificateId);
            element.packItemId && !packItemIds.includes(element.packItemId) && packItemIds.push(element.packItemId);
            element.colliPackId && !colliPackIds.includes(element.colliPackId) && colliPackIds.push(element.colliPackId);
        });

        switch(collection){
            case 'po':
                Po.updateMany({
                        _id: { $in : poIds } 
                    },
                    { $set: { [fieldName]: fieldValue } 
                })
                .then( () => {
                    return res.status(200).json({message: 'Successfully updated.'});
                })
                .catch( () => {
                    return res.status(400).json({ message: 'this Field cannot be updated.' });
                });
            break;
            case 'sub':
                if(fieldName === 'nfi' && !_.isUndefined(rfiDateAct)) {
                    Sub.updateMany({
                        _id: { $in : subIds } 
                        },
                        { $set: {
                            [fieldName]: fieldValue,
                            rfiDateAct: rfiDateAct
                        } 
                    })
                    .then( () => {
                        return res.status(200).json({message: 'Successfully updated.'});
                    })
                    .catch( () => {
                        return res.status(400).json({ message: 'Could not assign NFI.' });
                    }); 
                } else {
                    Sub.updateMany({
                        _id: { $in : subIds } 
                        },
                        { $set: {
                            [fieldName]: fieldValue
                        } 
                    })
                    .then( () => {
                        return res.status(200).json({message: 'Successfully updated.'});
                    })
                    .catch( () => {
                        return res.status(400).json({ message: 'Field cannot be updated.' });
                    });
                }
            break;
            case 'certificate':
                Certificate.updateMany({
                    _id: { $in : certificateIds } 
                    },
                    { $set: { [fieldName]: fieldValue } 
                })
                .then( () => {
                    return res.status(200).json({message: 'Successfully updated.'});
                })
                .catch( () => {
                    return res.status(400).json({ message: 'Field cannot be updated.' });
                });
            break;
            case 'packitem':

                selectedIds.map(function (selectedId) {
                    myPromises.push(upsert(selectedId, fieldName, fieldValue));
                });
                
                await Promise.all(myPromises).then(resMyPromises => {
                    
                    resMyPromises.map(r => {
                        if (r.isRejected) {
                            nRejected++;
                        } else if (r.isEdited) {
                            nEdited++;
                        } else if (r.isAdded) {
                            nAdded++;
                        }
                    });
                        
                    return res.status(nRejected > 0 ? 400 : 200).json({
                        message: `${nEdited} item(s) edited, ${nAdded} item(s) added, ${nRejected} item(s) rejected.`
                    });

                });

            break;
            case 'collipack':
                if (fieldName === 'plNr' || fieldName === 'colliNr') {
                    return res.status(400).json({ message: 'plNr and colliNr cannot be edited.' });
                } else {
                    selectedIds.map(function (selectedId) {
                        myPromises.push(editColliPack(selectedId, fieldName, fieldValue));
                    });

                    await Promise.all(myPromises).then(resMyPromises => {
                    
                        resMyPromises.map(r => {
                            if (r.isRejected) {
                                nRejected++;
                            } else if (r.isEdited) {
                                nEdited++;
                            } else if (r.isAdded) {
                                nAdded++;
                            }
                        });
                            
                        return res.status(nRejected > 0 ? 400 : 200).json({
                            message: `${nEdited} item(s) edited, ${nAdded} item(s) added, ${nRejected} item(s) rejected.`
                        });
    
                    });
                }
            break;
            default: return res.status(400).json({ message: 'this Field cannot be updated.' });
        }
    } else {
        return res.status(400).json({ message: 'this Field cannot be updated.' });
    }
    
});

module.exports = router;


function editColliPack(selectedId, fieldName, fieldValue) {
    return new Promise(function (resolve) {
        if (!!selectedId.colliPackId) {
            let query = { _id: selectedId.colliPackId };
            let update = { $set: { [fieldName]: fieldValue } };
            let options = { new: true };
            ColliPack.findOneAndUpdate(query, update, options, function(errColliPack) {
                if (errColliPack) {
                    resolve({
                        isEdited: false,
                        isAdded: false,
                        isRejected: true, 
                    });
                } else {
                    resolve({
                        isEdited: true,
                        isAdded: false,
                        isRejected: false, 
                    });
                }
            });
        } else {
            resolve({
                isEdited: false,
                isAdded: false,
                isRejected: true, 
            });
        }
    });
}


function upsert(selectedId, fieldName, fieldValue) {
    return new Promise(function(resolve){
        if (!!selectedId.packItemId || !!selectedId.subId) {
            let query = selectedId.packItemId ? { _id: selectedId.packItemId } : { _id: new ObjectId() };
            let update = { $set: { [fieldName]: fieldValue, subId: selectedId.subId } };
            let options = { new: true, upsert: true };
            PackItem.findOneAndUpdate(query, update, options, function(errPackItem) {
                if (errPackItem) {
                    resolve({
                        isEdited: false,
                        isAdded: false,
                        isRejected: true,
                    });
                } else {
                    resolve({
                        isEdited: selectedId.packItemId ? true : false,
                        isAdded: selectedId.packItemId ? false: true,
                        isRejected: false,
                    });
                }
            });
        } else {
            resolve({
                isEdited: false,
                isAdded: false,
                isRejected: true, 
            });
        }
    });
}
