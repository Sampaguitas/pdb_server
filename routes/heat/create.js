const express = require('express');
const router = express.Router();
const Heat = require('../../models/Heat');

router.post('/', (req, res) => {
            const newHeat = new Heat({
                heatNr: req.body.heatNr,
                inspQty: req.body.inspQty,
                certIndex: req.body.certIndex,
                poId: req.body.poId,
                subId: req.body.subId,
                returnId: req.body.returnId,
                certificateId: req.body.certificateId,
            });

            newHeat
                .save()
                .then( () => res.status(200).json({message: 'Heat has successfully been created.'}))
                .catch( () => res.status(400).json({message: 'Heat could not be created.'}));
});
module.exports = router;