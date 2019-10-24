const express = require('express');
const router = express.Router();
const FieldName = require('../../models/FieldName');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    FieldName.find({projectId: req.query.projectId})
    .populate({
        path: 'fields',
        //select:'custom'
    })
    .exec(function (err, fieldname) {
        if (!fieldname) {
            return res.status(400).json({
                message: fault(0804).message
                //"0804": "No FieldName match",
            });
        }
        else {
            return res.json(fieldname);
        }
    });
});

module.exports = router;