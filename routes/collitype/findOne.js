const express = require('express');
const router = express.Router();
const ColliType = require('../../models/ColliType');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    ColliType.findById(id, function (err, collitype) {
        if (!collitype) {
            return res.status(404).json({
                message: fault(0301).message
                //"0301": "ColliType does not exist",
            });
        }
        else {
            return res.json(collitype);
        }
    });
});


module.exports = router;
