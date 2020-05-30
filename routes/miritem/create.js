const express = require('express');
const router = express.Router();
const MirItem = require('../../models/MirItem');

router.post('/', (req, res) => {
            const newMirItem = new MirItem({
                lineNr: req.body.lineNr,
                qtyRequired: req.body.qtyRequired,
                unitWeight: req.body.unitWeight,
                mirId: req.body.mirId,
                poId: req.body.poId,
            });

            newMirItem
                .save()
                .then( () => res.status(200).json({message: 'MirItem successfully created.'}))
                .catch( () => res.status(400).json({message: 'An error has occured.'}));
});
module.exports = router;