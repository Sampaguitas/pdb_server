const express = require('express');
const router = express.Router();
const DocField = require('../../models/DocField');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    DocField.findByIdAndRemove(id, function (err, docfield) {
        if (!docfield) {
            return res.status(400).json({
                message: fault(2601).message
                //"2601": "DocField does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(2603).message,
                //"2603": "DocField has been deleted",
            });
        }
    });
});

module.exports = router;