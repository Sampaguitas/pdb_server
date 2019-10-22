const express = require('express');
const router = express.Router();
const Field = require('../../models/Field');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    // var data = {};
    // Object.keys(req.body).forEach(function (k) {
    //     data[k] = req.body[k];
    // });

    Field.find({projectId: req.query.projectId}, function (err, field) {
        if (!field) {
            return res.status(400).json({
                message: fault(0704).message
                //"0704": "No Field match",
            });
        }
        else {
            return res.json(field);
        }
    });
});

module.exports = router;