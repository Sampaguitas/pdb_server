const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');
const fault = require('../../utilities/Errors');

require('../../models/User');
const User = require('../../models/User');


router.get('/', (req, res) => {
    const id = req.query.id
    //const Autentification = req.s.Autentification // need condition with token
    User.findById(id, function (err, user) {
        if (!user) {
            return res.status(404).json({
                res_no: 101,
                res_message: fault(101).message
                    //"101": "User does not exist",
            });
        }
        else {
            return res.json(user);
        }
    });
});


module.exports = router;
