// const express = require('express');
const passport = require('passport');
const Fault = require('../utilities/Errors');

module.exports = (req, res, next) => {
    passport.authenticate(
        "jwt",
        { session: false }, (err, user) => {
            if (err) return res.json(Fault(256));
            if (!user) return res.json(Fault(257));
            next()
        }
    )
    (req, res, next)
}