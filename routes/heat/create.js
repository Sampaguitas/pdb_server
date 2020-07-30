const express = require('express');
const router = express.Router();
const Heat = require('../../models/Heat');

router.post('/', (req, res) => {
    
            const newHeat = new Heat({
                heatNr: req.body.heatNr,
                inspQty: req.body.inspQty,
                certIndex: !!req.body.certIndex ? req.body.certIndex : undefined,
                poId: !!req.body.poId ? req.body.poId : undefined,
                subId: !!req.body.subId ? req.body.subId : undefined,
                returnId: !!req.body.returnId ? req.body.returnId : undefined,
                certificateId: !!req.body.certificateId ? req.body.certificateId : undefined,
            });

            newHeat
                .save()
                .then( () => res.status(200).json({message: 'Heat has successfully been created.'}))
                .catch( (err) => {
                    console.log(err)
                    res.status(400).json({message: 'Heat could not be created.'})
                });
});
module.exports = router;