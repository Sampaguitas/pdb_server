const express = require('express');
const router = express.Router();
const DocFlow = require('../../models/DocFlow');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocFlow.findByIdAndRemove(id, function (err, docflow) {
        if (!docflow) {
            return res.status(400).json({
                message: fault(0501).message
                //"0501": "DocFlow does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(0503).message,
                //"0503": "DocFlow has been deleted",
            });
        }
    });
});

module.exports = router;