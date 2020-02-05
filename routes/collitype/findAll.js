const express = require('express');
const router = express.Router();
const ColliType = require('../../models/ColliType');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {

    ColliType.find({projectId: req.query.projectId}, function (err, collitype) {
        if (!collitype) {
            return res.status(400).json({
                message: 'No ColliType match'
                //"0304": "No ColliType match",
            });
        }
        else {
            return res.json(collitype);
        }
    });
});

module.exports = router;