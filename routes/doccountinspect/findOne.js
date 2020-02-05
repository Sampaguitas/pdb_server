const express = require('express');
const router = express.Router();
const DocCountInspect = require('../../models/DocCountInspect');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    DocCountInspect.findById(id, function (err, doccountinspect) {
            if (!doccountinspect) {
                return res.status(400).json({
                    message: 'DocCountInspect does not exist'
                    //"1801": "DocCountInspect does not exist",
                });
            }
            else {
                return res.json(doccountinspect);
            }
        });
});

module.exports = router;