const express = require('express');
const router = express.Router();
const Po = require('../../models/Po');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    Po.findByIdAndRemove(id, function (err, po) {
        if (!po) {
            return res.status(400).json({
                message: fault(1201).message
                //"1201": "Po does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1203).message
                //"1203": "Po has been deleted",
            });
        }
    });
});

module.exports = router;