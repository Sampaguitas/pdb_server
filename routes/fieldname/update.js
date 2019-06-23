const express = require('express');
const router = express.Router();
const FieldName = require('../../models/FieldName');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};
    console.log('body:', req.body);
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

    const id = req.query.id
    FieldName.findByIdAndUpdate(id, { $set: data }, function (err, fieldname) {
        if (!fieldname) {
            return res.status(400).json({
                message: fault(0801).message
                //"0801": "FieldName does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(0802).message
                //"0802": "FieldName has been updated",
            });
        }
    });
});

module.exports = router;
