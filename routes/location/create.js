const express = require('express');
const router = express.Router();
const Location = require('../../models/Location');

router.post('/', (req, res) => {

            const newLocation = new Location({
                //_id: req.body.id,
                area: req.body.area,
                hall: req.body.hall,
                row: req.body.row,
                row: req.body.row,
                height: req.body.height,
                tc: req.body.tc,
                type: req.body.type,
                warehouseId: req.body.warehouseId,
            });

            newLocation
                .save()
                .then( () => res.status(200).json({message: 'Location successfully created.'}))
                .catch( () => res.status(400).json({message: 'An error has occured.'}));
});
module.exports = router;