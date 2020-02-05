const express = require('express');
const router = express.Router();
const FieldName = require('../../models/FieldName');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        if (req.body[k] == true || req.body[k] == false) {
            data[k] = req.body[k];
        } else {
            data[k] = decodeURI(req.body[k]);
        }
    });
    const id = req.query.id
    FieldName.findByIdAndUpdate(id, { $set: data }, function (err, fieldname) {
        if (!fieldname) {
            return res.status(400).json({
                message: 'FieldName does not exist'
                //"0801": "FieldName does not exist",
            });
        }
        else {
            console.log("fieldname:", fieldname);
            return res.status(200).json({
                message: 'FieldName has been updated'
                //"0802": "FieldName has been updated",
            });
        }
    });
});

module.exports = router;
