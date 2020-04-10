const express = require('express');
const router = express.Router();
const Warehouse = require('../../models/Warehouse');

router.post('/', (req, res) => {

            const newWarehouse = new Warehouse({
                //_id: req.body.id,
                name: req.body.name,
                projectId: req.body.projectId,
            });

            newWarehouse
                .save()
                .then( () => res.status(200).json({message: 'Warehouse successfully created.'}))
                .catch( () => res.status(400).json({message: 'An error has occured.'}));
});
module.exports = router;