const express = require('express');
const router = express.Router();
const Incoterm = require('../../models/Incoterm');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    Incoterm.findById(id, function (err, incoterm) {
        if (!incoterm) {
            return res.status(404).json({
                message: fault(801).message
                //"801": "Incoterm does not exist",
            });
        }
        else {
            return res.json(incoterm);
        }
    });
});


module.exports = router;
