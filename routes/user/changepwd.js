const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const fault = require('../../utilities/Errors');

router.put('/', (req, res) => {

    const _id = req.query.id;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;
    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            message: fault(1605).message
            //"1605": "Password does not match",
        });

    } else {
        User.findOne({ _id }, { password:1 }).then(user => {
            if (!user) {
                return res.status(400).json({
                    message: fault(1601).message
                    //"1601": "User does not exist",
                });
            }
            bcrypt.compare(oldPassword, user.password).then(isMatch => {
                if (isMatch) {
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newPassword, salt, (err, hash) => {
                            if (err) {
                                return res.status(400).json({
                                    message: fault(1606).message
                                    //"1606": "Error generating hashed token",
                                });
                            }
                            const password = hash;
                            User.findByIdAndUpdate( {_id}, { $set: password}, function (err, pwd) {
                                if (!pwd) {
                                    return res.status(400).json({
                                        message: fault(1601).message
                                        //"1601": "User does not exist",
                                    });
                                }
                                else {
                                    return res.status(200).json({
                                        message: fault(1607).message
                                        //"1607": "Password has been updated",,
                                    });
                                }
                            } )
                        });
                    });
                }
            });
        });
    }
});


module.exports = router;

//https://webapplog.com/express-js-and-mongoose-example-building-hackhall/