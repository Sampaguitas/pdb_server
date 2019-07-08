const express = require('express');
const router = express.Router();
const DocCountPl = require('../../models/DocCountPl');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocCountPl.findByIdAndRemove(id, function (err, doccountpl) {
        if (!doccountpl) {
            return res.status(400).json({
                message: fault(1801).message
                //"1801": "DocCountPl does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1803).message
                //"1803": "DocCountPl has been deleted",
            });
        }
    });
});

module.exports = router;