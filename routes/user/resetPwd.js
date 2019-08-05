const express = require('express');
const router = express.Router();
const User = require('../../models/User'); //
const ResetPassword = require('../../models/ResetPassword'); //
const fault = require('../../utilities/Errors');
const bcrypt = require('bcrypt');

router.put('/', (req, res) => {
    const userId = req.body.userId;
    const token = decodeURI(req.body.token);
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;
    console.log('userId:', userId);
    console.log('token:', token);
    console.log('newPassword:', newPassword);
    console.log('confirmPassword:', confirmPassword);
    if (newPassword !== confirmPassword) {
        console.log('position 0');
        return res.status(404).json({
            message: fault(1605).message
            //"1605": "Password does not match",
        });
    } else {
        ResetPassword.findOne({ userId: userId, status: 0 })
        .then(function (resetPassword) {
            if (!resetPassword) {
                console.log('position 1');
                return res.status(404).json({
                    message: fault(1610).message
                    //"1610": "Invalid or expired token"
                });
            } else {
                console.log('DB token:', resetPassword.token);
                console.log('req.body.token:', token);
                if (resetPassword.token =! token) {
                    console.log('position 2');
                    return res.status(404).json({
                        message: fault(1610).message
                        //"1610": "Invalid or expired token"
                    });                
                } else {
                    let expiry = moment.utc(resetPassword.expire);
                    let currentTime = new Date();
                    if (expiry > currentTime) {
                        console.log('position 3');
                        return res.status(404).json({
                            message: fault(1610).message
                            //"1610": "Invalid or expired token"
                        });
                    } else {
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(newPassword, salt, (err, hash) => {
                                if (err) {
                                    console.log('position 4');
                                    return res.status(400).json({
                                        message: JSON.stringify(err)
                                    });
                                } else if (!hash) {
                                    console.log('position 5');
                                    return res.status(400).json({
                                        message: fault(1606).message
                                        //"1606": "Error generating hashed token",
                                    });                             
                                } else {
                                    const password = hash;
                                    User.findByIdAndUpdate({_id: userId}, { $set: {password: password} }, function (err, pwd) {
                                        if (err) {
                                            console.log('position 6');
                                            return res.status(400).json({
                                                message: JSON.stringify(err)
                                            });
                                        } else if (!pwd) {
                                            console.log('position 7');
                                            return res.status(400).json({
                                                message: fault(1601).message
                                                //"1601": "User does not exist",
                                            });
                                        } else {
                                            ResetPassword.findByIdAndUpdate({_id: resetPassword._id}, { $set: {status: 1} }, function(err, reset) {
                                                if (err) {
                                                    console.log('position 8');
                                                    return res.status(400).json({
                                                        message: JSON.stringify(err)
                                                    });
                                                } else if (!reset) {
                                                    console.log('position 9');
                                                    return res.status(400).json({
                                                        message: fault(0001).message
                                                        //"0001": "Something went wrong",
                                                    });

                                                } else {
                                                    console.log('position 10');
                                                    return res.status(200).json({
                                                        message: fault(1607).message
                                                        //"1607": "Password has been updated",
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    }

                }                    
            }
        }).catch(err => {
            console.log('position 12');
            return res.status(400).json({
                message: JSON.stringify(err)
            });
        });
    }
});

module.exports = router;
