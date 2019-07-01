const express = require('express');
const router = express.Router();
const DocType = require('../../models/DocType');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocType.findByIdAndRemove(id, function (err, doctype) {
        if (!doctype) {
            return res.status(400).json({
                message: fault(2501).message
                //"2501": "DocType does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(2503).message,
                //"2503": "DocType has been deleted",
            });
        }
    });
});

module.exports = router;