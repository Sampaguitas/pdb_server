const express = require('express');
const router = express.Router();
const DocCountNfi = require('../../models/DocCountNfi');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountNfi.findByIdAndRemove(id, function (err, doccountnfi) {
        if (!doccountnfi) {
            return res.status(400).json({
                message: 'DocCountNfi does not exist'
                //"1801": "DocCountNfi does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'DocCountNfi has been deleted'
                //"1803": "DocCountNfi has been deleted",
            });
        }
    });
});

module.exports = router;