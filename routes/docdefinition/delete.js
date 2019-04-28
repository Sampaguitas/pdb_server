const express = require('express');
const router = express.Router();
const DocDefinition = require('../../models/DocDefinition');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocDefinition.findByIdAndRemove(id, function (err, docdefinition) {
        if (!docdefinition) {
            return res.status(400).json({
                message: fault(0401).message
                //"0401": "DocDefinition does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(0403).message,
                //"0403": "DocDefinition has been deleted",
            });
        }
    });
});

module.exports = router;