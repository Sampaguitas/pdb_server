const express = require('express');
const router = express.Router();
const Field = require('../../models/Field');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {

    Field.find({projectId: req.query.projectId})
    .sort({
        fromTbl: 'asc',
        name: 'asc',
    })
    .exec(function (err, field) {
        if (!field) {
            return res.status(400).json({ message: 'No Fields where found.' });
        }
        else {
            return res.json(field);
        }
    });
    
});

module.exports = router;