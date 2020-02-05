const express = require('express');
const router = express.Router();
const DocCountInsprel = require('../../models/DocCountInsprel');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    DocCountInsprel.findById(id, function (err, doccountinsprel) {
            if (!doccountinsprel) {
                return res.status(400).json({
                    message: 'DocCountInsprel does not exist'
                    //"1801": "DocCountInsprel does not exist",
                });
            }
            else {
                return res.json(doccountinsprel);
            }
        });
});

module.exports = router;