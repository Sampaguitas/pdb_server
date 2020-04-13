const express = require('express');
const router = express.Router();
const Area = require('../../models/Area');

router.post('/', (req, res) => {

            const newArea = new Area({
                //_id: req.body.id,
                number: req.body.number,
                name: req.body.name,
                warehouseId: req.body.warehouseId,
            });

            newArea
                .save()
                .then( () => res.status(200).json({message: 'Area successfully created.'}))
                .catch( () => res.status(400).json({message: 'An error has occured.'}));
});
module.exports = router;