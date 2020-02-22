const express = require('express');
const router = express.Router();
const FieldName = require('../../models/FieldName');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    FieldName.find({projectId: req.query.projectId})
    .sort({
        // screenId: 'asc',
        forShow: 'asc',
        forSelect: 'asc',
    })
    .populate({
        path: 'fields',
        options: {
            sort: {
                custom: 'asc',
            }
        }
    })
    .exec(function (err, fieldname) {
        if (!fieldname) {
            return res.status(400).json({ message: 'No FieldName where found.' });
        }
        else {
            return res.json(fieldname);
        }
    });
});

module.exports = router;