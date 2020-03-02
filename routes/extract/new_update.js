const express = require('express');
const router = express.Router();
const Po = require('../../models/Po');
const Sub = require('../../models/Sub');
const Certificate = require('../../models/Certificate');
const PackItem = require('../../models/PackItem');
const ColliPack = require('../../models/ColliPack');
const _ = require('lodash');
// const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {

    let collection = req.body.collection;
    let fieldName = req.body.fieldName;
    let fieldValue = decodeURI(req.body.fieldValue);
    let selectedIds = req.body.selectedIds;

    let poIds = [];
    let subIds = [];
    let certificateIds = [];
    let packItemIds = [];
    let colliPackIds = [];

    selectedIds.forEach(element => {
        element.poId && !poIds.includes(element.poId) && poIds.push(element.poId);
        element.subId && !subIds.includes(element.subId) && subIds.push(element.subId);
        element.certificateId && !certificateIds.includes(element.certificateId) && certificateIds.push(element.certificateId);
        element.packItemId && !packItemIds.includes(element.packItemId) && packItemIds.push(element.packItemId);
        element.colliPackId && !colliPackIds.includes(element.colliPackId) && colliPackIds.push(element.colliPackId);
    });

    if(!collection || !fieldName || _.isEmpty(selectedIds)) {
        return res.status(400).json({ message: 'this Field cannot be updated' });
    } else {
        switch(collection){
            case 'po':
                Po.updateMany({
                     _id: { $in : poIds } 
                    },
                    { $set: { [fieldName]: fieldValue } 
                })
                .then( () => {
                    return res.status(200).json({message: 'Successfully updated'});
                })
                .catch( () => {
                    return res.status(400).json({ message: 'this Field cannot be updated' });
                });
            break;
            case 'sub':
                Sub.updateMany({
                    _id: { $in : subIds } 
                    },
                    { $set: { [fieldName]: fieldValue } 
                })
                .then( () => {
                    return res.status(200).json({message: 'Successfully updated'});
                })
                .catch( () => {
                    return res.status(400).json({ message: 'this Field cannot be updated' });
                });
            break;
            case 'certificate':
                Certificate.updateMany({
                    _id: { $in : certificateIds } 
                    },
                    { $set: { [fieldName]: fieldValue } 
                })
                .then( () => {
                    return res.status(200).json({message: 'Successfully updated'});
                })
                .catch( () => {
                    return res.status(400).json({ message: 'this Field cannot be updated' });
                });
            break;
            case 'packitem':
                PackItem.updateMany({
                    _id: { $in : packItemIds } 
                    },
                    { $set: { [fieldName]: fieldValue } 
                })
                .then( () => {
                    return res.status(200).json({message: 'Successfully updated'});
                })
                .catch( () => {
                    return res.status(400).json({ message: 'this Field cannot be updated' });
                });
            break;
            case 'collipack':
                ColliPack.updateMany({
                    _id: { $in : colliPackIds } 
                    },
                    { $set: { [fieldName]: fieldValue } 
                })
                .then( () => {
                    return res.status(200).json({message: 'Successfully updated'});
                })
                .catch( () => {
                    return res.status(400).json({ message: 'this Field cannot be updated' });
                });
            break;
            default: return res.status(400).json({ message: 'this Field cannot be updated' });
        }
    }
});

module.exports = router;
