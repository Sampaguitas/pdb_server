const express = require('express');
const router = express.Router();
const DocDef = require('../../models/DocDef');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocDef.findByIdAndRemove(id, function (err, docdef) {
        if (!docdef) {
            return res.status(400).json({
                message: fault(0401).message
                //"0401": "DocDef does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(0403).message,
                //"0403": "DocDef has been deleted",
            });
        }
    });
});

module.exports = router;