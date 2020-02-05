const express = require('express');
const router = express.Router();
const DocCountPf = require('../../models/DocCountPf');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountPf.findByIdAndRemove(id, function (err, doccountpf) {
        if (!doccountpf) {
            return res.status(400).json({
                message: 'DocCountPf does not exist'
                //"1801": "DocCountPf does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: 'DocCountPf has been deleted'
                //"1803": "DocCountPf has been deleted",
            });
        }
    });
});

module.exports = router;