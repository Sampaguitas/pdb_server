const express = require('express');
const router = express.Router();
const Sub = require('../../models/Sub');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    Sub.findByIdAndRemove(id, function (err, sub) {
        if (!sub) {
            return res.status(400).json({
                message: fault(1401).message
                //"1401": "Sub does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(1403).message
                //"1403": "Sub has been deleted",
            });
        }
    });
});

module.exports = router;