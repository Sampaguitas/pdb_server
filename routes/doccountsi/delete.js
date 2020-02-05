const express = require('express');
const router = express.Router();
const DocCountSi = require('../../models/DocCountSi');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountSi.findByIdAndRemove(id, function (err, doccountsi) {
        if (!doccountsi) {
            return res.status(400).json({
                message: 'DocCountSi does not exist'
                //"1801": "DocCountSi does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'DocCountSi has been deleted'
                //"1803": "DocCountSi has been deleted",
            });
        }
    });
});

module.exports = router;