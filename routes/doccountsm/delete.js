const express = require('express');
const router = express.Router();
const DocCountSm = require('../../models/DocCountSm');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountSm.findByIdAndRemove(id, function (err, doccountsm) {
        if (!doccountsm) {
            return res.status(400).json({
                message: fault(1801).message
                //"1801": "DocCountSm does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1803).message
                //"1803": "DocCountSm has been deleted",
            });
        }
    });
});

module.exports = router;