const express = require('express');
const router = express.Router();
const DocCountSm = require('../../models/DocCountSm');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountSm.findByIdAndRemove(id, function (err, doccountsm) {
        if (!doccountsm) {
            return res.status(400).json({
                message: 'DocCountSm does not exist'
                //"1801": "DocCountSm does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'DocCountSm has been deleted'
                //"1803": "DocCountSm has been deleted",
            });
        }
    });
});

module.exports = router;