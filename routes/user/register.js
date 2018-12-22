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
            return res.status(400).json({
                res_no: 100,
                res_message: fault(100).message
                //"100": "User already exists"
                });
        } else {
            const newUser = new User({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                password: req.body.password
            });

            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err){
                        return res.status(400).json({
                            res_no: 106,
                            res_message: fault(106).message
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
});

module.exports = router;