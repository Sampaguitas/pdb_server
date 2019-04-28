const express = require('express');
const router = express.Router();
const Field = require('../../models/Field');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    Field.findById(id, function (err, field) {
        if (!field) {
            return res.status(404).json({
                message: fault(0701).message
                //"0701": "Field does not exist",
            });
        }
        else {
            return res.json(field);
        }
    });
});


module.exports = router;
