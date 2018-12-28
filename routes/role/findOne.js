const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');
const fault = require('../../utilities/Errors');

require('../../models/Role');
const Role = require('../../models/Role');


router.get('/', (req, res) => {
    const id = req.query.id
    //const Autentification = req.s.Autentification // need condition with token
    Role.findById(id, function (err, role) {
        if (!role) {
            return res.status(404).json({
                res_no: 401,
                res_message: fault(401).message
                //"401": "Role does not exist",
            });
        }
        else {
            return res.json(role);
        }
    });
});


module.exports = router;
