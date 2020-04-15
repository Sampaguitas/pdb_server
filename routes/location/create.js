const express = require('express');
const router = express.Router();
const Location = require('../../models/Location');

router.post('/', (req, res) => {

            const newLocation = new Location({
                //_id: req.body.id,
                hall: req.body.hall,
                row: req.body.row,
                col: req.body.col,
                height: req.body.height,
                tc: req.body.tc,
                type: req.body.type,
                areaId: req.body.areaId,
            });

            newLocation
                .save()
                .then( () => res.status(200).json({message: 'Location successfully created.'}))
                .catch( () => res.status(400).json({message: 'An error has occured.'}));
});
module.exports = router;