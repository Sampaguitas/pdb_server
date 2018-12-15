const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const fault = require('../../utilities/Errors')
const keys = require('../../config/keys');


router.get('/', (req, res) => {
    var data = {};
    Object.keys(req.body).forEach(function (k) {
        data[k] = req.body[k];
    });

User.find(data, function (err, user) {
        if (!user) {
            return res.status(400).json({ error: 260, message: fault(260).message });
            // "260": "User does not exist"
        }
        else {
            return res.json(user);
        }
    });
});


module.exports = router;