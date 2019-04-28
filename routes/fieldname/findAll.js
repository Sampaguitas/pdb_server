const express = require('express');
const router = express.Router();
const FieldName = require('../../models/FieldName');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    FieldName.find(data, function (err, fieldname) {
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