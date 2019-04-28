const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const fault = require('../../utilities/Errors');

router.get('/', (req, res) => {
    const id = req.query.id
    User.findById(id, function (err, user) {
        if (!user) {
            return res.status(404).json({
                message: fault(1601).message
                    //"1601": "User does not exist",
            });
        }
        else {
            return res.json(user);
        }
    });
});

module.exports = router;
