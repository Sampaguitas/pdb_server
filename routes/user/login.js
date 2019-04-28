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
    User.findOne({ email }, { password:1 , userName:1, isAdmin:1, opco:1 }).then(user => {
        if (!user) {
            return res.status(404).json({
                message: fault(1601).message
                //"1601": "User does not exist",
            });
        }
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {                          
                const payload = { id: user.id, userName: user.userName, name: user.name, email: user.email, isAdmin: user.isAdmin, opco: user.opco };
                jwt.sign(
                    payload,
                    keys.secret,
                    { expiresIn: 3600 },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token,
                            id: payload.id,
                            userName: payload.userName,
                            name: payload.name,
                            email: payload.email,
                            isAdmin: payload.isAdmin,
                            opco: payload.opco
                        });
                    }
                );
            } else {
                return res.status(400).json({
                    message: fault(1605).message
                    //"1605": "Password does not match",
                });
            }
        });
    });
});

module.exports = router;