const express = require('express');
const router = express.Router();
const Mir = require('../../models/Mir');

router.post('/', (req, res) => {
            const newMir = new Mir({
                //_id: req.body.id,
                // vlMir: req.body.vlMir,
                clMir: req.body.clMir,
                dateReceived: req.body.dateReceived,
                dateExpected: req.body.dateExpected,
                projectId: req.body.projectId,
            });

            newMir
                .save()
                .then( () => res.status(200).json({message: 'Mir successfully created.'}))
                .catch( () => res.status(400).json({message: 'An error has occured.'}));
});
module.exports = router;