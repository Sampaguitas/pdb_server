const express = require('express');
const router = express.Router();
const DocCountEsr = require('../../models/DocCountEsr');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountEsr.findByIdAndRemove(id, function (err, doccountesr) {
        if (!doccountesr) {
            return res.status(400).json({
                message: fault(1801).message
                //"1801": "DocCountEsr does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1803).message
                //"1803": "DocCountEsr has been deleted",
            });
        }
    });
});

module.exports = router;