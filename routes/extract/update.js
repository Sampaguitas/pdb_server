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
    let objectIds = req.body.objectIds;

    // let data = `${fieldName}:${fieldValue}`

    if(!collection || !fieldName || _.isEmpty(objectIds)) {
        return res.status(400).json({ message: 'this Field cannot be updated' });
    } else {
        switch(collection){
            case 'po':
                Po.updateMany({
                     _id: { $in : objectIds } 
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
                    _id: { $in : objectIds } 
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
                    _id: { $in : objectIds } 
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
                    _id: { $in : objectIds } 
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
                    _id: { $in : objectIds } 
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
