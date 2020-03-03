const express = require('express');
const router = express.Router();
const Po = require('../../models/Po');
const Sub = require('../../models/Sub');
const Certificate = require('../../models/Certificate');
const PackItem = require('../../models/PackItem');
const ColliPack = require('../../models/ColliPack');
const _ = require('lodash');

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

    selectedIds.forEach(element => {
        element.poId && !poIds.includes(element.poId) && poIds.push(element.poId);
        element.subId && !subIds.includes(element.subId) && subIds.push(element.subId);
        element.certificateId && !certificateIds.includes(element.certificateId) && certificateIds.push(element.certificateId);
        element.packItemId && !packItemIds.includes(element.packItemId) && packItemIds.push(element.packItemId);
        element.colliPackId && !colliPackIds.includes(element.colliPackId) && colliPackIds.push(element.colliPackId);
    });

    if(!collection || !fieldName || _.isEmpty(selectedIds)) {
        return res.status(400).json({ message: 'this Field cannot be updated.' });
    } else {
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
                selectedIds.map(function (selectedId, index) {
                    myPromises.push(upsert(selectedId, fieldName, fieldValue, index));
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
                })
                .catch ( () => {
                    return res.status(400).json({
                        message: `${nEdited} item(s) edited, ${nAdded} item(s) added, ${nRejected} item(s) rejected.`
                    });
                });
            break;
            case 'collipack':
                ColliPack.updateMany({
                    _id: { $in : colliPackIds } 
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
            default: return res.status(400).json({ message: 'this Field cannot be updated.' });
        }
    }
});

module.exports = router;

function upsert(selectedId, fieldName, fieldValue, index) {
    return new Promise(function(resolve){
        if (selectedId.packItemId) {
            PackItem.findByIdAndUpdate(selectedId.packItemId, {
                 $set: { [fieldName]: fieldValue } 
                }, function (errPackItem) {
                if (errPackItem) {
                    resolve({
                        index: index,
                        isEdited: false,
                        isAdded: false,
                        isRejected: true,
                    });
                } else {
                    resolve({
                        index: index,
                        isEdited: true,
                        isAdded: false,
                        isRejected: false,
                    });
                }
            });
        } else if (selectedId.subId) {
            let tempDocument = { subId: selectedId.subId };
            tempDocument[fieldName] = fieldValue;
            PackItem.create(tempDocument).then( () => {
                resolve({
                    index: index,
                    isEdited: false,
                    isAdded: true,
                    isRejected: false,
                });
            })
            .catch( () => {
                resolve({
                    index: index,
                    isEdited: false,
                    isAdded: false,
                    isRejected: true,
                });
            });
        } else {
            resolve({
                index: index,
                isEdited: false,
                isAdded: false,
                isRejected: true, 
            });
        }
    });
}
