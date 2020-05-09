const express = require('express');
const router = express.Router();
const Certificate = require('../../models/Certificate');

router.post('/', (req, res) => {
            const newCertificate = new Certificate({
                cif: req.body.cif,
                projectId: req.body.projectId
            });

            newCertificate
                .save()
                .then( () => res.status(200).json({message: 'Certificate has successfully been created.'}))
                .catch( () => res.status(400).json({message: 'Certificate could not be created.'}));
});
module.exports = router;