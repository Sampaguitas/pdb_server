const express = require('express');
const router = express.Router();
const Po = require('../../models/Po');
const Sub = require('../../models/Sub');
const Certificate = require('../../models/Certificate');
const PackItem = require('../../models/PackItem');
const WhPackItem = require('../../models/WhPackItem');
const ColliPack = require('../../models/ColliPack');
const WhColliPack = require('../../models/WhColliPack');
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
    let packitemIds = [];
    let collipackIds = [];
    let pickitemIds = [];
    let whpackitemIds = [];
    let whcollipackIds = []

    let myPromises = [];
    let nEdited = 0;
    let nAdded = 0;
    let nRejected = 0;

    if (!_.isUndefined(selectedIds) && !_.isEmpty(selectedIds) && !!collection || !!fieldName ) {
        selectedIds.forEach(element => {
            element.poId && !poIds.includes(element.poId) && poIds.push(element.poId);
            element.subId && !subIds.includes(element.subId) && subIds.push(element.subId);
            element.certificateId && !certificateIds.includes(element.certificateId) && certificateIds.push(element.certificateId);
            element.packitemId && !packitemIds.includes(element.packitemId) && packitemIds.push(element.packitemId);
            element.collipackId && !collipackIds.includes(element.collipackId) && collipackIds.push(element.collipackId);
            element.pickitemId && !pickitemIds.includes(element.pickitemId) && pickitemIds.push(element.pickitemId);
            element.whpackitemId && !whpackitemIds.includes(element.whpackitemId) && whpackitemIds.push(element.whpackitemId);
            element.whcollipackId && !whcollipackIds.includes(element.whcollipackId) && whcollipackIds.push(element.whcollipackId);
        });

        switch(collection){
            case 'po':
                if (fieldName === 'project' || fieldName === 'projectNr') {
                    return res.status(400).json({ message: 'Project name and project number cannot be edited.' });
                } else {
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
                }
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
                    selectedIds.map(function (selectedId) {
                        myPromises.push(editSub(selectedId, fieldName, fieldValue));
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
                    // Sub.updateMany({
                    //     _id: { $in : subIds } 
                    //     },
                    //     { $set: {
                    //         [fieldName]: fieldValue
                    //     } 
                    // })
                    // .then( () => {
                    //     return res.status(200).json({message: 'Successfully updated.'});
                    // })
                    // .catch( () => {
                    //     return res.status(400).json({ message: 'Field cannot be updated.' });
                    // });
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
                    myPromises.push(upsertPackItem(selectedId, fieldName, fieldValue));
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
            case 'whpackitem':

                selectedIds.map(function (selectedId) {
                    myPromises.push(upsertWhPackItem(selectedId, fieldName, fieldValue));
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
            case 'whcollipack':
                if (fieldName === 'plNr' || fieldName === 'colliNr') {
                    return res.status(400).json({ message: 'plNr and colliNr cannot be edited.' });
                } else {
                    selectedIds.map(function (selectedId) {
                        myPromises.push(editWhColliPack(selectedId, fieldName, fieldValue));
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

function editWhColliPack(selectedId, fieldName, fieldValue) {
    return new Promise(function (resolve) {
        if (!!selectedId.whcollipackId) {
            let query = { _id: selectedId.whcollipackId };
            let update = { $set: { [fieldName]: fieldValue } };
            let options = { new: true };
            WhColliPack.findOneAndUpdate(query, update, options, function(errWhColliPack) {
                if (errWhColliPack) {
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


function editColliPack(selectedId, fieldName, fieldValue) {
    return new Promise(function (resolve) {
        if (!!selectedId.collipackId) {
            let query = { _id: selectedId.collipackId };
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

function editSub(selectedId, fieldName, fieldValue) {
    return new Promise(function(resolve){
        if (!!selectedId.subId) {
            let query = { _id: selectedId.subId };
            let update = { $set: { [fieldName]: fieldValue } };
            let options = { new: true };
            Sub.findOneAndUpdate(query, update, options, function(errSub) {
                if (errSub) {
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


function upsertPackItem(selectedId, fieldName, fieldValue) {
    return new Promise(function(resolve){
        if (!!selectedId.packitemId || !!selectedId.subId) {
            let query = selectedId.packitemId ? { _id: selectedId.packitemId } : { _id: new ObjectId() };
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
                        isEdited: selectedId.packitemId ? true : false,
                        isAdded: selectedId.packitemId ? false: true,
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

function upsertWhPackItem(selectedId, fieldName, fieldValue) {
    return new Promise(function(resolve){
        if (!!selectedId.whpackitemId || !!selectedId.pickitemId) {
            let query = selectedId.whpackitemId ? { _id: selectedId.whpackitemId } : { _id: new ObjectId() };
            let update = { $set: { [fieldName]: fieldValue, pickitemId: selectedId.pickitemId } };
            let options = { new: true, upsert: true };
            WhPackItem.findOneAndUpdate(query, update, options, function(errPackItem) {
                if (errPackItem) {
                    resolve({
                        isEdited: false,
                        isAdded: false,
                        isRejected: true,
                    });
                } else {
                    resolve({
                        isEdited: selectedId.whpackitemId ? true : false,
                        isAdded: selectedId.whpackitemId ? false: true,
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


