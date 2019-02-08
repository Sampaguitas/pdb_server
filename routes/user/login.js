const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const User = require('../../models/User');
const fault = require('../../utilities/Errors');

router.post('/', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email }, { password:1 , firstName:1, lastName:1, phone:1, email:1, isAdmin:1 }).then(user => {
        if (!user) {
            return res.status(404).json({
                message: fault(101).message
                //"101": "User does not exist",
            });
        }
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {                          
                const payload = { id: user.id, firstName: user.firstName, lastName: user.lastName, phone: user.phone, email: user.email, isAdmin: user.isAdmin };
                jwt.sign(
                    payload,
                    keys.secret,
                    { expiresIn: 3600 },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token,
                            id: payload.id,
                            firstName: payload.firstName,
                            lastName: payload.lastName,
                            phone: payload.phone,
                            email: payload.email,
                            isAdmin: payload.isAdmin
                        });
                    }
                );
            } else {
                return res.status(400).json({
                    message: fault(105).message
                    //"105": "Password does not match",
                });
            }
        });
    });
});

module.exports = router;