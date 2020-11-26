const express = require('express');
const router = express.Router();
const User = require('../../models/User'); //
const ResetPassword = require('../../models/ResetPassword'); //
const fault = require('../../utilities/Errors');
const moment = require('moment');
const bcrypt = require('bcrypt');

router.put('/', (req, res) => {
    const userId = req.body.userId;
    const token = decodeURI(req.body.token);
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;
    if (newPassword !== confirmPassword) {
        return res.status(404).json({
            message: fault(1605).message
            //"1605": "Password does not match",
        });
    } else {
        ResetPassword.findOne({userId: userId, status: 0}, function (err, resetPassword){
            if (err) {
                return res.status(400).json({
                    message: JSON.stringify(err)
                });
            } else if (!resetPassword) {
                return res.status(404).json({
                    message: fault(1610).message
                    //"1610": "Invalid or expired token"
                });
            } else {
                if (resetPassword.token =! token) {
                    return res.status(404).json({
                        message: fault(1610).message
                        //"1610": "Invalid or expired token"
                    });                
                } else {
                    let expiry = resetPassword.expire;
                    let currentTime = new Date();
                    console.log('expiry:', expiry);
                    console.log('currentTime:', currentTime);
                    if (expiry <= currentTime) {
                        return res.status(404).json({
                            message: fault(1610).message
                            //"1610": "Invalid or expired token"
                        });
                    } else {
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(newPassword, salt, (err, hash) => {
                                if (err) {
                                    return res.status(400).json({
                                        message: JSON.stringify(err)
                                    });
                                } else if (!hash) {
                                    return res.status(400).json({
                                        message: fault(1606).message
                                        //"1606": "Error generating hashed token",
                                    });                             
                                } else {
                                    const password = hash;
                                    User.findByIdAndUpdate({_id: userId}, { $set: {password: password} }, function (err, pwd) {
                                        if (err) {
                                            return res.status(400).json({
                                                message: JSON.stringify(err)
                                            });
                                        } else if (!pwd) {
                                            return res.status(400).json({
                                                message: fault(1601).message
                                                //"1601": "User does not exist",
                                            });
                                        } else {
                                            ResetPassword.findByIdAndUpdate({_id: resetPassword._id}, { $set: {status: 1} }, function(err, reset) {
                                                if (err) {
                                                    return res.status(400).json({
                                                        message: JSON.stringify(err)
                                                    });
                                                } else if (!reset) {
                                                    return res.status(400).json({
                                                        message: fault(0001).message
                                                        //"0001": "Something went wrong",
                                                    });

                                                } else {
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
        });
    }
});

module.exports = router;
