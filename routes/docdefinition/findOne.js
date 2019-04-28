const express = require('express');
const router = express.Router();
const DocDefinition = require('../../models/DocDefinition');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    DocDefinition.findById(id, function (err, docdefinition) {
        if (!docdefinition) {
            return res.status(404).json({
                message: fault(0401).message
                //"0401": "DocDefinition does not exist",
            });
        }
        else {
            return res.json(docdefinition);
        }
    });
});


module.exports = router;
