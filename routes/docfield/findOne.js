const express = require('express');
const router = express.Router();
const DocField = require('../../models/DocField');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    DocField.findById(id, function (err, docfield) {
        if (!docfield) {
            return res.status(404).json({
                message: 'DocField does not exist'
                //"2601": "DocField does not exist",
            });
        }
        else {
            return res.json(docfield);
        }
    });
});


module.exports = router;
