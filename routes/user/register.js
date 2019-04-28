const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../../models/User');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
    if (req.body.password !== req.body.confirmPassword) {
        return res.status(400).json({
            message: fault(1605).message
            //"1605": "Password does not match",  
        });
    } else {
        User.findOne({ email: req.body.email.toLowerCase() }).then(user => {
            if (user) {
                return res.status(400).json({
                    message: fault(1600).message
                    //"1600": "User already exists",
                });
            } else {
                const newUser = new User({
                    userName: req.body.userName,
                    name: req.body.name,
                    email: req.body.email.toLowerCase(),
                    password: req.body.password,
                    isAdmin: req.body.isAdmin,
                    opcoId: req.body.opcoId,
                    daveId: req.body.daveId,
                });
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) {
                            return res.status(400).json({
                                message: fault(1606).message
                                //"1606": "Error generating hashed token",
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