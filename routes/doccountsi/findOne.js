const express = require('express');
const router = express.Router();
const DocCountSi = require('../../models/DocCountSi');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    DocCountSi.findById(id, function (err, doccountsi) {
            if (!doccountsi) {
                return res.status(400).json({
                    message: 'DocCountSi does not exist'
                    //"1801": "DocCountSi does not exist",
                });
            }
            else {
                return res.json(doccountsi);
            }
        });
});

module.exports = router;