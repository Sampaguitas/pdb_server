const express = require('express');
const router = express.Router();
const Field = require('../../models/Field');
const fault = require('../../utilities/Errors');


router.delete('/', (req, res) => {
    const id = req.query.id
    Field.findByIdAndRemove(id, function (err, field) {
        if (!field) {
            return res.status(400).json({
                message: fault(0701).message
                //"0701": "Field does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(0703).message,
                //"0703": "Field has been deleted",
            });
        }
    });
});

module.exports = router;