const express = require('express');
const router = express.Router();
const Incoterm = require('../../models/Incoterm');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
    Incoterm.findOne({ code: req.body.code }).then(incoterm => {
        if (incoterm) {
            return res.status(400).json({
                message: fault(800).message
                //"800": "Incoterm already exists",
            });
        } else {

            const newIncoterm = new Incoterm({
                code: req.body.code,
                name: req.body.name
            });

            newIncoterm
                .save()
                .then(incoterm => res.json(incoterm))
                .catch(err => res.json(err));
        }
    });
});
module.exports = router;