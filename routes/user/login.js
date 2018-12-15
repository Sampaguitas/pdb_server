const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');
const fault = require('../../utilities/Errors');

require('../../models/User');
const User = require('../../models/User');

// @desc    Login User / Returning JWT Token
// @access  Public
router.post('/', (req, res) => {

    const email = req.body.email;
    const password = req.body.password;

    // Find user by email
    User.findOne({ email }, { password:1 , firstname:1, lastname:1, email:1}).then(user => {
        // Check for user
        if (!user) {
            return res.status(404).json(fault(257));
        }
        
        // Check Password
        bcrypt.compare(password, user.password).then(isMatch => {
            if (isMatch) {
                // User Matched                              
                const payload = { id: user.id, firstname: user.firstname, lastname: user.lastname, email: user.email }; // Create JWT Payload

                // Sign Token
                jwt.sign(
                    payload,
                    keys.secret,
                    { expiresIn: 3600 },
                    (err, token) => {
                        res.json({
                            success: true,
                            token: 'Bearer ' + token,
                            id: payload.id,
                            firstname: payload.firstname,
                            lastname: payload.lastname,
                            email: payload.email
                        });
                    }
                );
            } else {
                return res.status(400).json(fault(258));
            }
        });
    });
});


module.exports = router;