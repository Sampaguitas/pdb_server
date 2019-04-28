// const express = require('express');
const passport = require('passport');
const fault = require('../utilities/Errors');

module.exports = (req, res, next) => {
    passport.authenticate(
        "jwt",
        { session: false }, (err, user) => {
            if (err) return res.status(400).json({
                message: fault(0001).message
                //"0001": "Something went wrong",
            });
            if (!user) return res.status(400).json({
                message: fault(1604).message
                //"1604": "No user match",
            });
            next()
        }
    )
        (req, res, next)
}
