const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {
    User.findOne(req.user._id, { isAdmin:1, isSuperAdmin: 1 }).then(user => {
        if (!user) {
            return res.status(400).json({
                message: fault(1601).message
                //"1601": "User does not exist",
            });
        } else if (!user.isAdmin && !user.isSuperAdmin) {
            return res.status(400).json({
                message: fault(0000).message
                //"0000": "Unauthorized",
            });
        } else {
            User.findByIdAndUpdate(req.query.id, { $set: { isAdmin: req.body.isAdmin } }, function(err, setUser) {
                if (!setUser) {
                    return res.status(400).json({
                        message: fault(1601).message
                        //"1601": "User does not exist",
                    });
                }
                else {
                    return res.status(200).json({
                        message: fault(1602).message
                        //"1602": "User has been updated",
                    });
                }
            });
        }
    });
});

module.exports = router;