const express = require('express');
const router = express.Router();
const DocCountPl = require('../../models/DocCountPl');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    DocCountPl.findById(id, function (err, doccountpl) {
            if (!doccountpl) {
                return res.status(400).json({
                    message: fault(1801).message
                    //"1801": "DocCountPl does not exist",
                });
            }
            else {
                return res.json(doccountpl);
            }
        });
});

module.exports = router;