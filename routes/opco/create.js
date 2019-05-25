const express = require('express');
const router = express.Router();
const Opco = require('../../models/Opco');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {

    Opco.findOne({ name: req.body.name }).then(opco => {
        if (opco) {
            return res.status(400).json({ 
                message: fault(1000).message
                    //"1000": "Opco already exists",
            });
        } else {

            const newOpco = new Opco({
                _id: req.body._id,
                code: req.body.code,
                name: req.body.name,
                address: req.body.address,
                city: req.body.city,
                zip: req.body.zip,
                country: req.body.country,
                localeId: req.body.localeId,
                regionId:req.body.regionId,
                daveId: req.body.daveId,
            });

            newOpco
                .save()
                .then(opco => res.json(opco))
                .catch(err => res.json(err));
        }
    });
});
module.exports = router;