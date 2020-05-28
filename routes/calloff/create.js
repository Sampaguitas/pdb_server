const express = require('express');
const router = express.Router();
const CallOff = require('../../models/CallOff');

router.post('/', (req, res) => {
            const newCallOff = new CallOff({
                //_id: req.body.id,
                // mirNr: req.body.mirNr,
                clCallOff: req.body.clCallOff,
                dateReceived: req.body.dateReceived,
                dateExpected: req.body.dateExpected,
                projectId: req.body.projectId,
            });

            newCallOff
                .save()
                .then( () => res.status(200).json({message: 'CallOff successfully created.'}))
                .catch( () => res.status(400).json({message: 'An error has occured.'}));
});
module.exports = router;