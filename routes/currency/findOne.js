const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');
const fault = require('../../utilities/Errors');

require('../../models/Currency');
const Currency = require('../../models/Currency');

router.get('/', (req, res) => {
    const id = req.query.id
    //const Autentification = req.s.Autentification // need condition with token
    Currency.findById(id, function (err, currency) {
        if (!currency) {
            return res.status(404).json({
                res_no: 401,
                res_message: fault(401).message
                //"401": "Currency does not exist",
            });
        }
        else {
            return res.json(currency);
        }
    });
});


module.exports = router;
