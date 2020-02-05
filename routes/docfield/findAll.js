const express = require('express');
const router = express.Router();
const DocField = require('../../models/DocField');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    DocField.find({projectId: req.query.projectId})
    .populate({
        path:'fields',
        select: 'custom'
    })
    .exec(function (err, docfield) {
        if (!docfield) {
            return res.status(400).json({
                message: 'No DocField match'
                //"2604": "No DocField match",
            });
        }
        else {
            return res.json(docfield);
        }
    });
});

module.exports = router;