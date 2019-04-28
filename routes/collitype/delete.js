const express = require('express');
const router = express.Router();
const ColliType = require('../../models/ColliType');
const fault = require('../../utilities/Errors');

router.delete('/', (req, res) => {
    const id = req.query.id
    ColliType.findByIdAndRemove(id, function (err, collitype) {
        if (!collitype) {
            return res.status(400).json({
                message: fault(0301).message
                //"0301": "ColliType does not exist",
            });
        }
        else {
            return res.status(200).json({
                message: fault(0303).message,
                //"0303": "ColliType has been deleted",
            });
        }
    });
});

module.exports = router;