const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');
const fault = require('../../utilities/Errors');

// Load User model
require('../../models/User');
const User = require('../../models/User');


router.post('/', (req, res) => {

    User.findOne({ email: req.body.email }).then(user => {
        if (user) {
            return res.status(400).json({ email: "Email already exists" });
        } else {
            const newUser = new User({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                password: req.body.password
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw fault(250);
                    newUser.password = hash;
                    newUser
                        .save()
                        .then(user => res.json(user))       //
                        .catch(err => res.json(err));    //.cath(err => jsonError(err))
                });
            });
        }
    });
});

module.exports = router;