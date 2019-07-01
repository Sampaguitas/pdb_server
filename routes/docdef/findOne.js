const express = require('express');
const router = express.Router();
const DocDef = require('../../models/DocDef');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    DocDef.findById(id, function (err, docdef) {
        if (!docdef) {
            return res.status(404).json({
                message: fault(0401).message
                //"0401": "DocDef does not exist",
            });
        }
        else {
            return res.json(docdef);
        }
    });
});


module.exports = router;
