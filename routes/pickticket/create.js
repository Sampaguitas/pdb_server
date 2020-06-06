const express = require('express');
const router = express.Router();
const PickTicket = require('../../models/PickTicket');

router.post('/', (req, res) => {
            const newPickTicket = new PickTicket({
                pickNr: req.body.pickNr,
                isProcessed: req.body.isProcessed,
                mirId: req.body.mirId,
                warehouseId: req.body.warehouseId,
                projectId: req.body.projectId,
            });

            newPickTicket
                .save()
                .then( () => res.status(200).json({message: 'PickTicket successfully created.'}))
                .catch( () => res.status(400).json({message: 'An error has occured.'}));
});

module.exports = router;