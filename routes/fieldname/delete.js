const express = require('express');
const router = express.Router();
const FieldName = require('../../models/FieldName');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    FieldName.findByIdAndRemove(id, function (err, fieldname) {
        if (!fieldname) {
            return res.status(400).json({
                message: fault(0801).message
                //"0801": "FieldName does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(0803).message,
                //"0803": "FieldName has been deleted",
            });
        }
    });
});

module.exports = router;