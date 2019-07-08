const express = require('express');
const router = express.Router();
const DocCountSm = require('../../models/DocCountSm');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    DocCountSm.findById(id, function (err, doccountsm) {
            if (!doccountsm) {
                return res.status(400).json({
                    message: fault(1801).message
                    //"1801": "DocCountSm does not exist",
                });
            }
            else {
                return res.json(doccountsm);
            }
        });
});

module.exports = router;