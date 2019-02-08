const express = require('express');
const router = express.Router();
const Opco = require('../../models/Opco');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {

    Opco.findOne({ name: req.body.name }).then(opco => {
        if (opco) {
            return res.status(400).json({ 
                message: fault(300).message
                    //"300": "OPCO already exists",
            });
        } else {

            const newOpco = new Opco({
                name: req.body.name,
                address: req.body.address,
                city: req.body.city,
                zip: req.body.zip,
                country: req.body.country,
                phone: req.body.phone,
                fax: req.body.fax,
                email: req.body.email,
                projectAdmins: req.body.projectAdmins// ["_id1", "_id2"]
            });

            newOpco
                .save()
                .then(opco => res.json(opco))
                .catch(err => res.json(err));
        }
    });
});
module.exports = router;