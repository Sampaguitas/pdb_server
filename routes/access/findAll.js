const express = require('express');
const router = express.Router();
const Access = require('../../models/Access');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {

    Access.find({projectId: req.query.projectId}, function (err, access) {
        if (!access) {
            return res.status(400).json({
                message: 'No Access match'
                //"2104": "No Access match",
            });
        }
        else {
            return res.json(access);
        }
    });
});

module.exports = router;
