const express = require('express');
const router = express.Router();
const DocCountInsprel = require('../../models/DocCountInsprel');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountInsprel.findByIdAndRemove(id, function (err, doccountinsprel) {
        if (!doccountinsprel) {
            return res.status(400).json({
                message: 'DocCountInsprel does not exist'
                //"1801": "DocCountInsprel does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'DocCountInsprel has been deleted'
                //"1803": "DocCountInsprel has been deleted",
            });
        }
    });
});

module.exports = router;