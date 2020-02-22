const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });
    User.find(data)
    .sort({
        name: 'asc'
    })
    .populate({
        path: 'opco',
        populate: {
            path: 'region'
        }
    })
    .exec(function (err, user) {
        if (!user) {
            return res.status(400).json({
                message: fault(1604).message
                    //"1604": "No user match",
                });
        }
        else {
            return res.json(user);
        }
    });
});

module.exports = router;