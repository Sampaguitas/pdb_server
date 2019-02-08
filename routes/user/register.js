const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({
            message: fault(105).message
            //"105": "Password does not match", 
        });
    } else {
        User.findOne({ email: req.body.email }).then(user => {
            if (user) {
                return res.status(400).json({
                    message: fault(100).message
                    //"100": "User already exists"
                });
            } else {
                const newUser = new User({
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    phone: req.body.phone,
                    email: req.body.email.toLowerCase(),
                    password: req.body.password,
                    isAdmin: req.body.isAdmin
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) {
                            return res.status(400).json({
                                message: fault(106).message
                                //"106": "Error generating hashed token"
                            });
                        }
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user => res.json(user))
                            .catch(err => res.json(err));
                    });
                });
            }
        });
    }
});

module.exports = router;