const express = require('express');
const router = express.Router();
const User = require('../../models/User'); //
const ResetPassword = require('../../models/ResetPassword'); //
const fault = require('../../utilities/Errors');
const crypto = require('crypto');
const moment = require('moment');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const keys = require('../../config/keys');

let transporter = nodemailer.createTransport({
    host: keys.mailerHost,
    port: keys.mailerPort,
    secure: false,
    auth: {
      user: keys.mailerAuthUser, 
      pass: keys.mailerAuthPass
    }
  });

router.post('/', (req, res) => {
    const email = req.body.email.toLowerCase();
    User.findOne({email})
    .then(function (user){
        if (!user) {
            return res.status(404).json({
                message: fault(1601).message
                    //"1601": "User does not exist",
            });
        } else {
            ResetPassword.findOne({ userId: user._id, status: 0 })
            .then(function (resetPassword) {
                if (resetPassword) {
                    ResetPassword.findByIdAndRemove(resetPassword._id);
                } else {
                    token = crypto.randomBytes(32).toString('hex');
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(token, salt, function (err, hash) {
                            if (err) {
                                return res.status(404).json({
                                    message: JSON.stringify('err')
                                });
                            } else if (!hash) {
                                return res.status(404).json({
                                    message: fault(1606).message
                                        //"1606": "Error generating hashed token",
                                });
                            } else {
                                const newResetPassword = new ResetPassword({
                                    userId: user._id,
                                    resetPasswordToken: hash,
                                    expire: moment.utc().add(3600, 'seconds'),
                                });
                                newResetPassword
                                .save()
                                .then(function (item) {
                                    if (!item) {
                                        return res.status(404).json({
                                            message: fault(1606).message
                                                //"1606": "Error generating hashed token",
                                        });
                                    } else {
                                        let mailOptions = {
                                            from: keys.myName + ' <' + keys.mailerAuthUser + '>',
                                            to: user.email,
                                            subject: 'Reset your account password',
                                            html: '<h4><b>Reset Password</b></h4>' +
                                            '<p>To reset your password, complete this form:</p>' +
                                            '<a href=https://www.vanleeuwenpdb.com/resetpwd?id=' + user._id + '&token=' + encodeURI(token) + '> https://www.vanleeuwenpdb.com/resetpwd?id=' + user._id + '&token=' + token + '<a/>' +
                                            '<br><br>' +
                                            '<p>' + keys.myName + '</p>' +
                                            '<p>' + keys.myPosition + '</p>' +
                                            '<p>'+ keys.myPhone + '</p>'
                                        };
                                        transporter.sendMail(mailOptions, (err, info) => {
                                            if (err) {
                                                return res.status(404).json({
                                                    message: JSON.stringify('err')
                                                });                                            
                                            } else if(info) {
                                                return res.status(200).json({
                                                    message: fault(1608).message
                                                        //"1606": "Check your email to reset your password",
                                                });
                                            } else {
                                                return res.status(404).json({
                                                    message: fault(1609).message
                                                        //"1609": "Unable to send the email verification",
                                                });
                                            }
                                        })
                                    }
                                })
                                .catch(error => {
                                    return res.status(404).json({
                                        message: JSON.stringify(error)
                                    });                            
                                });
                            }
                        });
                    });
                }
            })
            .catch(error => {
                return res.status(404).json({
                    message: JSON.stringify(error)
                });                
            });
        }
    })
    .catch(error => {
        return res.status(404).json({
            message: JSON.stringify(error)
        });        
    });
});

module.exports = router;
