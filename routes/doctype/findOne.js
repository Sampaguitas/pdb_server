const express = require('express');
const router = express.Router();
const DocType = require('../../models/DocType');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    DocType.findById(id, function (err, doctype) {
        if (!doctype) {
            return res.status(404).json({
                message: fault(2501).message
                //"2501": "DocType does not exist",
            });
        }
        else {
            return res.json(doctype);
        }
    });
});


module.exports = router;
