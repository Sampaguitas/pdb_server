const express = require('express');
const router = express.Router();
const MirItem = require('../../models/MirItem');

router.post('/', (req, res) => {
            const newMirItem = new MirItem({
                // lineNr: req.body.lineNr,
                qtyRequired: req.body.qtyRequired,
                // unitWeight: req.body.unitWeight,
                mirId: req.body.mirId,
                poId: req.body.poId,
            });

            newMirItem
                .save()
                .then( () => res.status(200).json({message: 'Item has successfully been created.'}))
                .catch( (err) => {
                    if (err.hasOwnProperty('message')) {
                        res.status(400).json({message: err.message});
                    } else {
                        res.status(400).json({message: 'An error has occured.'});
                    }
                });
                    
});
module.exports = router;