const express = require('express');
const router = express.Router();
const DocCountNfi = require('../../models/DocCountNfi');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    DocCountNfi.findById(id, function (err, doccountnfi) {
            if (!doccountnfi) {
                return res.status(400).json({
                    message: fault(1801).message
                    //"1801": "DocCountNfi does not exist",
                });
            }
            else {
                return res.json(doccountnfi);
            }
        });
});

module.exports = router;