const express = require('express');
const router = express.Router();
const Incoterm = require('../../models/Incoterm');
const fault = require('../../utilities/Errors');


router.delete('/', (req, res) => {
    const id = req.query.id
    Incoterm.findByIdAndRemove(id, function (err, incoterm) {
        if (!incoterm) {
            return res.status(400).json({
                message: fault(801).message
                //"801": "Incoterm does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(803).message,
                //"803": "Incoterm has been deleted",
            });
        }
    });
});

module.exports = router;