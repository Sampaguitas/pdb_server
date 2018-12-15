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
router.get('/', (req, res) => {
    const id = req.query.id
    //const Autentification = req.s.Autentification // need condition with token
    User.findById(id, function (err, user) {
        if (!user) {
            return res.status(404).json(fault(257)); //if (err) throw err;
        }
        else {
            return res.json(user); //return user.email
        }
    });
});


module.exports = router;

//   const password = req.body.password;

  // Find user by email
//   User.find({firstname}).then(User => {//findById
//     // Check for user
//     if (!User) {
//       return res.status(404).json(fault(257)); //if (err) throw err;
//     }
//     else{
//       return res.json(User); //return user.email
//     }

//   })
// });
