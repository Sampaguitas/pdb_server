const express = require('express');
const router = express.Router();
const Access = require('../../models/Access');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    // var data = {};
    // Object.keys(req.body).forEach(function (k) {
    //     data[k] = req.body[k];
    // });

    Access.find({projectId: req.query.projectId}, function (err, access) {
        if (!access) {
            return res.status(400).json({
                message: fault(2104).message
                //"2104": "No Access match",
            });
        }
        else {
            return res.json(access);
        }
    });
});

module.exports = router;