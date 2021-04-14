const express = require('express');
const router = express.Router();
const DocCountTr = require('../../models/DocCountTr');

router.get('/', (req, res) => {
    const id = req.query.id
    DocCountTr.findById(id, function (err, doccounttr) {
            if (!doccounttr) {
                return res.status(400).json({
                    message: 'DocCountTr does not exist'
                    //"1801": "DocCountTr does not exist",
                });
            }
            else {
                return res.json(doccounttr);
            }
        });
});

module.exports = router;