const express = require('express');
const router = express.Router();
const DocCountInspect = require('../../models/DocCountInspect');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountInspect.findByIdAndRemove(id, function (err, doccountinspect) {
        if (!doccountinspect) {
            return res.status(400).json({
                message: 'DocCountInspect does not exist'
                //"1801": "DocCountInspect does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'DocCountInspect has been deleted'
                //"1803": "DocCountInspect has been deleted",
            });
        }
    });
});

module.exports = router;