const express = require('express');
const router = express.Router();
const DocCountEsr = require('../../models/DocCountEsr');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    DocCountEsr.findById(id, function (err, doccountesr) {
            if (!doccountesr) {
                return res.status(400).json({
                    message: fault(1801).message
                    //"1801": "DocCountEsr does not exist",
                });
            }
            else {
                return res.json(doccountesr);
            }
        });
});

module.exports = router;