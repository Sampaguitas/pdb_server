const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const fault = require('../../utilities/Errors')


router.get('/', (req, res) => {

    User.find({}, function (err, user) {
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