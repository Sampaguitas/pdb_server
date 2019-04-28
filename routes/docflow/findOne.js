const express = require('express');
const router = express.Router();
const DocFlow = require('../../models/DocFlow');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    DocFlow.findById(id, function (err, docflow) {
        if (!docflow) {
            return res.status(404).json({
                message: fault(0501).message
                //"0501": "DocFlow does not exist",
            });
        }
        else {
            return res.json(docflow);
        }
    });
});


module.exports = router;
