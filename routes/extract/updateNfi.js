const express = require('express');
const router = express.Router();
const Sub = require('../../models/Sub');
const _ = require('lodash');

router.put('/', (req, res) => {

    let inputNfi = req.body.inputNfi;
    let rfiDateAct = decodeURI(req.body.rfiDateAct);
    let objectIds = req.body.objectIds;

    if(_.isEmpty(objectIds)) {
        return res.status(400).json({ message: 'You need to select line(s) to assign NFI.' });
    } else {
        Sub.updateMany({
            _id: { $in : objectIds } 
            },
            { $set: {
                nfi: inputNfi,
                rfiDateAct: rfiDateAct
            } 
        })
        .then( () => {
            return res.status(200).json({message: 'Successfully updated'});
        })
        .catch( () => {
            return res.status(400).json({ message: 'Could not assign NFI.' });
        });
    }
});

module.exports = router;
