const express = require('express');
const router = express.Router();
const FieldName = require('../../models/FieldName');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    FieldName.findById(id, function (err, fieldname) {
        if (!fieldname) {
            return res.status(404).json({
                message: fault(0801).message
                //"0801": "FieldName does not exist",
            });
        }
        else {
            return res.json(fieldname);
        }
    });
});


module.exports = router;
