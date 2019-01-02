const express = require('express');
const router = express.Router();
const Opco = require('../../models/Opco');
const fault = require('../../utilities/Errors')


router.get('/', (req, res) => {
    const id = req.query.id
    Opco.findById(id, function (err, opco) {
        if (!opco) {
            return res.status(400).json({ 
                message: fault(301).message
                //"301": "OPCO does not exist",
            });
        }
        else {
            return res.json(opco);
        }
    });
});


module.exports = router;